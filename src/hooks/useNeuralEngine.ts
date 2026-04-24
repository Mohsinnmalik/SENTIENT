"use client";

import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

// ── Types ─────────────────────────────────────────────────────

export type DetectionQuality = "full" | "face_only" | "no_camera" | "failed";

export type GestureType = 
  | "thumbsUp" 
  | "thumbsDown" 
  | "pointingUp" 
  | "openPalm" 
  | "fist" 
  | "pinch" 
  | "peace" 
  | "open" 
  | null;

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

interface NeuralStats {
  score: number;
  expression: string;
  expressionLabel: string;
  expressionConfidence: number;
  faceDetected: boolean;
  handDetected: boolean;
  gesture: GestureType;
  gestureLabel: string;
  sentiment: number;
  box: { x: number; y: number; width: number; height: number } | null;
  breakdown: {
    expression: number;
    sentiment: number;
    presence: number;
  };
  detectionQuality: DetectionQuality;
  noFaceSeconds: number;
  postureState: "leaning_in" | "neutral" | "leaning_back";
}

// ── Constants ──────────────────────────────────────────────────

const EXPRESSION_WEIGHTS: Record<string, number> = {
  happy:     +3.0,
  surprised: +2.0,
  neutral:   +0.5,
  fearful:   -1.0,
  sad:       -2.5,
  disgusted: -4.0,
  angry:     -4.0,
};

export const EXPRESSION_LABELS: Record<string, string> = {
  happy:     "Happy 😊",
  surprised: "Surprised 😲",
  neutral:   "Neutral 😐",
  fearful:   "Concerned 😟",
  sad:       "Sad 😔",
  disgusted: "Disgusted 😒",
  angry:     "Unhappy 😠",
};

export const GESTURE_LABELS: Record<string, string> = {
  thumbsUp:    "Approval 👍",
  thumbsDown:  "Rejection 👎",
  pointingUp:  "High Interest ☝️",
  openPalm:    "Neutral 🖐️",
  fist:        "Conviction ✊",
  pinch:       "Examining 🤏",
  peace:       "Positive ✌️",
  open:        "Open Hand 🖐️",
};

const GESTURE_WEIGHTS: Record<string, number> = {
  thumbsUp:   +3.5,
  peace:      +2.0,
  pointingUp: +2.5,
  pinch:      +1.5,
  openPalm:    0.0,
  fist:       +1.0,
  open:       +0.5,
  thumbsDown: -4.0,
};

// ── Global State (Singleton approach to avoid reloading) ───────

let modelsLoaded = false;
let globalStream: MediaStream | null = null;
let handsInstance: {
  send: (data: { image: HTMLVideoElement }) => Promise<void>;
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (callback: (results: { multiHandLandmarks?: Landmark[][] }) => void) => void;
} | null = null;

// ── Helper: Gesture Classification ─────────────────────────────

function classifyGesture(landmarks: Landmark[]): GestureType {
  if (!landmarks || landmarks.length < 21) return null;
  
  const wrist  = landmarks[0];
  const thumb  = landmarks[4];
  const index  = landmarks[8];
  const middle = landmarks[12];
  const ring   = landmarks[16];
  const pinky  = landmarks[20];
  
  const dist = (a: Landmark) => Math.sqrt((a.x - wrist.x) ** 2 + (a.y - wrist.y) ** 2);
  
  const fingerTips = [index, middle, ring, pinky];
  const fingerMCPs = [landmarks[5], landmarks[9], landmarks[13], landmarks[17]];
  const extended = fingerTips.map((tip, i) => dist(tip) > dist(fingerMCPs[i]) + 0.03);
  const extCount = extended.filter(Boolean).length;
  
  const thumbExtended = Math.abs(thumb.x - landmarks[2].x) > 0.06;
  const pinchDist = Math.sqrt((thumb.x - index.x) ** 2 + (thumb.y - index.y) ** 2);
  
  if (pinchDist < 0.05) return "pinch";
  if (thumbExtended && extCount <= 1) return thumb.y < wrist.y ? "thumbsUp" : "thumbsDown";
  if (extended[0] && extended[1] && !extended[2] && !extended[3]) return "peace";
  if (extended[0] && !extended[1] && !extended[2] && !extended[3]) return "pointingUp";
  if (extCount >= 4) return "openPalm";
  if (extCount === 0) return "fist";
  
  return "open";
}

// ── Hook: Neural Engine ────────────────────────────────────────

export function useNeuralEngine(active: boolean = false) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectionQual, setDetectionQual] = useState<DetectionQuality>("full");

  const [stats, setStats] = useState<NeuralStats>({
    score: 0,
    expression: "neutral",
    expressionLabel: "Neutral 😐",
    expressionConfidence: 0,
    faceDetected: false,
    handDetected: false,
    gesture: null,
    gestureLabel: "—",
    sentiment: 0,
    box: null,
    breakdown: { expression: 0, sentiment: 0, presence: 0 },
    detectionQuality: "full",
    noFaceSeconds: 0,
    postureState: "neutral",
  });

  const gestureRef = useRef<GestureType>(null);
  const handsDetectedRef = useRef(false);
  const runningRef = useRef(false);
  const noFaceCountRef = useRef(0);
  const frameCountRef = useRef(0);
  const emotionBufferRef = useRef<string[]>([]);
  const BUFFER_SIZE = 8;

  // 1. Resource Initialization
  useEffect(() => {
    if (!active) return;
    
    async function init() {
      try {
        if (!modelsLoaded) {
          // Attempt high-accuracy load
          try {
            await Promise.all([
              faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
              faceapi.nets.faceExpressionNet.loadFromUri("/models"),
            ]);
            modelsLoaded = true;
          } catch {
            // Fallback to lightweight models
            await Promise.all([
              faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
              faceapi.nets.faceExpressionNet.loadFromUri("/models"),
            ]);
            modelsLoaded = true;
          }

          // Hands Analysis Initialization
          try {
            const { Hands } = await import("@mediapipe/hands");
            handsInstance = new Hands({
              locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
            });
            
            if (handsInstance) {
              handsInstance.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.65,
                minTrackingConfidence: 0.65,
              });
              handsInstance.onResults((results) => {
                if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                  handsDetectedRef.current = true;
                  gestureRef.current = classifyGesture(results.multiHandLandmarks[0]);
                } else {
                  handsDetectedRef.current = false;
                  gestureRef.current = null;
                }
              });
            }
          } catch {
            setDetectionQual("face_only");
          }
        }

        if (!globalStream) {
          globalStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
          });
        }

        if (videoRef.current && !videoRef.current.srcObject) {
          videoRef.current.srcObject = globalStream;
          try {
            await videoRef.current.play();
          } catch (e) {
            console.warn("Autoplay blocked, waiting for interaction", e);
          }
        }
        setIsReady(true);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("[useNeuralEngine Init Error]", error);
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          setCameraError("Camera Permission Denied: Please allow access in your browser settings.");
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          setCameraError("No camera found. Please connect a webcam.");
        } else {
          setCameraError(`Neural Link Failed: ${error.message}`);
        }
        setDetectionQual("failed");
      }
    }
    init();
  }, [active]);

  // 2. Inference Loop
  useEffect(() => {
    if (!isReady || !active) return;

    const interval = setInterval(async () => {
      const video = videoRef.current;
      if (runningRef.current || !video || video.readyState < 3 || !modelsLoaded) return;
      
      runningRef.current = true;
      frameCountRef.current++;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let detection: any = null;
        
        const isSsdLoaded = faceapi.nets.ssdMobilenetv1.isLoaded;
        const isTinyLoaded = faceapi.nets.tinyFaceDetector.isLoaded;

        if (isSsdLoaded) {
          try {
            detection = await faceapi.detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })).withFaceExpressions();
          } catch {
            if (isTinyLoaded) {
              detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
            }
          }
        } else if (isTinyLoaded) {
          detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        }

        if (handsInstance && video) {
          await handsInstance.send({ image: video });
        }

        const handDetected = handsDetectedRef.current;
        const gesture = gestureRef.current;

        let expr = "neutral";
        let exprLabel = EXPRESSION_LABELS.neutral;
        let exprConf = 0;
        let exprW = 0;
        let box = null;
        let pState: "leaning_in" | "neutral" | "leaning_back" = "neutral";
        let pWeight = 0;

        if (detection) {
          noFaceCountRef.current = 0;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const expressions = detection.expressions;
          const sorted = Object.entries(expressions).sort(([, a], [, b]) => (b as number) - (a as number));
          
          let currentBest = sorted[0][0].toLowerCase();
          
          // Neutral Bias Mitigation
          if (currentBest === "neutral" && sorted[1] && (sorted[1][1] as number) > 0.25) {
             if ((sorted[0][1] as number) - (sorted[1][1] as number) < 0.45) {
                currentBest = sorted[1][0].toLowerCase();
             }
          }

          emotionBufferRef.current.push(currentBest);
          if (emotionBufferRef.current.length > BUFFER_SIZE) {
            emotionBufferRef.current.shift();
          }

          const counts: Record<string, number> = {};
          emotionBufferRef.current.forEach(e => counts[e] = (counts[e] || 0) + 1);
          expr = Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0];

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          exprConf = expressions[expr] as number;
          exprLabel = EXPRESSION_LABELS[expr] || "Neutral 😐";
          exprW = (EXPRESSION_WEIGHTS[expr] || 0);

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const detBox = detection.detection.box;
          const { x, y, width, height } = detBox;
          box = { 
            x: (x / video.videoWidth) * 100, 
            y: (y / video.videoHeight) * 100, 
            width: (width / video.videoWidth) * 100, 
            height: (height / video.videoHeight) * 100 
          };

          if (width / video.videoWidth > 0.3) {
            pState = "leaning_in";
            pWeight = 2;
          } else if (width / video.videoWidth < 0.14) {
            pState = "leaning_back";
            pWeight = -2;
          }
        } else {
          noFaceCountRef.current++;
          emotionBufferRef.current = [];
        }

        const gWeight = gesture ? (GESTURE_WEIGHTS[gesture] || 0) : 0;
        const presWeight = detection ? 2.5 : -4;
        const raw = exprW + presWeight + gWeight + pWeight;
        const norm = Math.max(0, Math.min(10, raw + 5));

        setStats(prev => {
          const alpha = frameCountRef.current < 10 ? 0.3 : 0.08;
          const smooth = prev.score * (1 - alpha) + norm * alpha;
          return {
            score: Math.round(smooth * 10) / 10,
            expression: expr,
            expressionLabel: exprLabel,
            expressionConfidence: Math.round(exprConf * 100),
            faceDetected: !(noFaceCountRef.current > 7),
            handDetected,
            gesture,
            gestureLabel: gesture ? (GESTURE_LABELS[gesture] || "—") : "—",
            sentiment: 0,
            box,
            postureState: pState,
            breakdown: { 
              expression: Math.round(exprW * 10) / 10, 
              sentiment: Math.round(gWeight * 10) / 10, 
              presence: Math.round((presWeight + pWeight) * 10) / 10 
            },
            detectionQuality: handsInstance ? "full" : "face_only",
            noFaceSeconds: Math.floor(noFaceCountRef.current / 5),
          };
        });
      } catch (err) {
        console.error("[useNeuralEngine] Inference Error:", err);
      } finally {
        runningRef.current = false;
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isReady, active]);

  return { 
    videoRef, 
    stats, 
    isReady, 
    error: cameraError, 
    cameraError, 
    detectionQuality: detectionQual 
  };
}
