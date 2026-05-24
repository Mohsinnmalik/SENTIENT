"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────

export type DetectionQuality = "full" | "face_only" | "no_camera" | "failed" | "waiting";

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

export interface NeuralStats {
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

const EXPRESSION_LABELS: Record<string, string> = {
  happy:     "Happy 😊",
  surprised: "Surprised 😲",
  neutral:   "Neutral 😐",
  fearful:   "Concerned 😟",
  sad:       "Sad 😔",
  disgusted: "Disgusted 😒",
  angry:     "Angry 😠",
};


function getExpressionLabel(expr: string): string {
  switch (expr) {
    case "happy": return "Happy 😊";
    case "surprised": return "Surprised 😲";
    case "neutral": return "Neutral 😐";
    case "fearful": return "Concerned 😟";
    case "sad": return "Sad 😔";
    case "disgusted": return "Disgusted 😒";
    case "angry": return "Angry 😠";
    default: return "Neutral 😐";
  }
}

function getExpressionWeight(expr: string): number {
  switch (expr) {
    case "happy": return 4.0;
    case "surprised": return 2.5;
    case "neutral": return 0.3;
    case "fearful": return -1.5;
    case "sad": return -3.0;
    case "disgusted": return -4.5;
    case "angry": return -4.5;
    default: return 0.3;
  }
}

function getGestureLabel(gesture: GestureType): string {
  if (!gesture) return "—";
  switch (gesture) {
    case "thumbsUp": return "Approval 👍";
    case "thumbsDown": return "Rejection 👎";
    case "pointingUp": return "High Interest ☝️";
    case "openPalm": return "Neutral 🖐️";
    case "fist": return "Conviction ✊";
    case "pinch": return "Examining 🤏";
    case "peace": return "Positive ✌️";
    case "open": return "Open Hand 🖐️";
    default: return "—";
  }
}

function getGestureWeight(gesture: GestureType): number {
  if (!gesture) return 0;
  switch (gesture) {
    case "thumbsUp": return 3.5;
    case "peace": return 2.0;
    case "pointingUp": return 2.5;
    case "pinch": return 1.5;
    case "openPalm": return 0.0;
    case "fist": return 1.0;
    case "open": return 0.5;
    case "thumbsDown": return -4.0;
    default: return 0;
  }
}

// Threshold below which we DON'T count a face detection as reliable (set to 0.30 for realistic tracking of forward-facing vs turned-away faces)
const DETECTION_SCORE_THRESHOLD = 0.30;
// Frames before we declare "face lost" (set to 20 for 2 seconds of buffer at 10fps)
const DISTRACTION_THRESHOLD = 20;
// Buffer size: smaller = MORE responsive to emotion changes (set to 3 for instant updates)
const EMOTION_BUFFER_SIZE = 3;
// Posture buffer (set to 4 for fast updates)
const POSTURE_BUFFER_SIZE = 4;

// ── Models State (module-level to avoid reload) ───────────────

let modelsLoaded = false;
let handsInstance: {
  send: (data: { image: HTMLVideoElement }) => Promise<void>;
  setOptions: (options: Record<string, unknown>) => void;
  onResults: (callback: (results: { multiHandLandmarks?: Landmark[][] }) => void) => void;
  close: () => void;
} | null = null;
let handsLoadingPromise: Promise<void> | null = null;

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

  const extended = [
    dist(index) > dist(landmarks[5]) + 0.025,
    dist(middle) > dist(landmarks[9]) + 0.025,
    dist(ring) > dist(landmarks[13]) + 0.025,
    dist(pinky) > dist(landmarks[17]) + 0.025,
  ];
  const extCount = extended.filter(Boolean).length;

  const thumbExtended = Math.abs(thumb.x - landmarks[2].x) > 0.05;
  const pinchDist = Math.sqrt((thumb.x - index.x) ** 2 + (thumb.y - index.y) ** 2);

  if (pinchDist < 0.05) return "pinch";
  if (thumbExtended && extCount <= 1) return thumb.y < wrist.y ? "thumbsUp" : "thumbsDown";
  if (extended[0] && extended[1] && !extended[2] && !extended[3]) return "peace";
  if (extended[0] && !extended[1] && !extended[2] && !extended[3]) return "pointingUp";
  if (extCount >= 4) return "openPalm";
  if (extCount === 0) return "fist";

  return "open";
}

// ── Hook ───────────────────────────────────────────────────────

export function useNeuralEngine(active: boolean = false) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectionQual, setDetectionQual] = useState<DetectionQuality>("waiting");
  const [modelsLoadedState, setModelsLoadedState] = useState(modelsLoaded);

  const [stats, setStats] = useState<NeuralStats>({
    score: 5,
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
    detectionQuality: "waiting",
    noFaceSeconds: 0,
    postureState: "neutral",
  });

  const gestureRef         = useRef<GestureType>(null);
  const handsDetectedRef   = useRef(false);
  const runningRef         = useRef(false);
  const noFaceCountRef     = useRef(0);
  const frameCountRef      = useRef(0);
  const emotionBufferRef   = useRef<string[]>([]);
  const postureBufferRef   = useRef<string[]>([]);
  const boxBufferRef       = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const scoreBufferRef     = useRef<number[]>([]);
  const inferenceCallsRef = useRef(0);

  // ── Camera stop helper ──────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // ── Resource Init ───────────────────────────────────────────
  useEffect(() => {
    if (!active) {
      // If we become inactive (session ended), STOP camera immediately
      stopCamera();
      setIsReady(false);
      setDetectionQual("waiting");
      return;
    }

    let cancelled = false;

    async function init() {
      // 1. Start Camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
            frameRate: { ideal: 30 },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); } catch { /* blocked */ }
        }

        setIsReady(true);
      } catch (err) {
        const error = err as Error;
        console.error("[NeuralEngine] Camera failed:", error);
        setCameraError(error.message);
        setDetectionQual("no_camera");
        return;
      }

      // 2. Load Models
      try {
        if (!modelsLoaded) {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceExpressionNet.loadFromUri("/models"),
          ]);
          modelsLoaded = true;
          console.log("[NeuralEngine] Models loaded.");
        }
        setModelsLoadedState(true);
        if (!cancelled) setDetectionQual("face_only");
      } catch (err) {
        const error = err as Error;
        console.error("[NeuralEngine] Model load failed:", err);
        if (!cancelled) {
          setDetectionQual("failed");
          toast.error(`Model load failed: ${error.message}`);
        }
      }

      // 3. Init Hands (non-blocking)
      if (!handsInstance) {
        if (!handsLoadingPromise) {
          handsLoadingPromise = (async () => {
            try {
              const mpHands = await import("@mediapipe/hands");
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const HandsClass = (mpHands as any).Hands ?? (mpHands as any).default?.Hands;
              if (HandsClass) {
                const instance = new HandsClass({
                  locateFile: (f: string) => typeof window !== "undefined"
                    ? `${window.location.origin}/mediapipe/hands/${f}`
                    : `/mediapipe/hands/${f}`,
                });
                instance.setOptions({
                  maxNumHands: 1,
                  modelComplexity: 1,
                  minDetectionConfidence: 0.6,
                  minTrackingConfidence: 0.6,
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                instance.onResults((results: any) => {
                  if (results.multiHandLandmarks?.length > 0) {
                    handsDetectedRef.current = true;
                    gestureRef.current = classifyGesture(results.multiHandLandmarks[0]);
                  } else {
                    handsDetectedRef.current = false;
                    gestureRef.current = null;
                  }
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handsInstance = instance as any;
              }
            } catch (e) {
              console.warn("[NeuralEngine] Hands disabled:", e);
              handsLoadingPromise = null;
            }
          })();
        }
        await handsLoadingPromise;
      }

      if (handsInstance && !cancelled) {
        setDetectionQual("full");
      }
    }

    init();

    return () => {
      cancelled = true;
      // Stop camera when component unmounts or active becomes false
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // ── Inference Loop ──────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !active || !modelsLoadedState) return;

    const runInference = async () => {
      const video = videoRef.current;
      inferenceCallsRef.current++;
      if (inferenceCallsRef.current % 20 === 1) {
        console.log("[NeuralEngine] pre-check:", {
          running: runningRef.current,
          videoExists: !!video,
          readyState: video?.readyState,
          videoWidth: video?.videoWidth,
          videoHeight: video?.videoHeight,
        });
      }
      if (runningRef.current || !video || video.readyState < 3 || video.videoWidth === 0) return;

      runningRef.current = true;
      try {
        frameCountRef.current++;

        // ── Face Detection (larger inputSize = better accuracy) ──
        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,            // 160→320: much better detection
          scoreThreshold: DETECTION_SCORE_THRESHOLD,
        });
        const detection = await faceapi
          .detectSingleFace(video, options)
          .withFaceExpressions();

        if (frameCountRef.current % 10 === 1) {
          console.log(`[NeuralEngine] frame: ${frameCountRef.current}, videoWidth: ${video.videoWidth}, detection:`, detection);
        }

        // ── Hands ──
        if (handsInstance && video) {
          handsInstance.send({ image: video }).catch(() => {});
        }

        const handDetected = handsDetectedRef.current;
        const gesture = gestureRef.current;

        let expr = "neutral";
        let exprLabel = EXPRESSION_LABELS.neutral;
        let exprConf = 0;
        let exprW = 0;
        let box: NeuralStats["box"] = null;
        let pState: NeuralStats["postureState"] = "neutral";
        let pWeight = 0;

        if (detection) {
          noFaceCountRef.current = 0;

          // ── Emotion: pick the DOMINANT emotion, not just neutral ──
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const expressions = (detection as any).expressions as Record<string, number>;
          const sorted = Object.entries(expressions).sort(([, a], [, b]) => b - a);

          // If top emotion confidence > 0.25, use it directly (was 0.5 before — far too strict)
          // If top is neutral but a strong second exists, use second
          let picked = sorted[0][0].toLowerCase();
          const topConf = sorted[0][1] as number;
          const secondConf = sorted[1] ? (sorted[1][1] as number) : 0;
          const secondName = sorted[1] ? sorted[1][0].toLowerCase() : "neutral";

          if (picked === "neutral" && secondConf > 0.20 && (topConf - secondConf) < 0.35) {
            picked = secondName;
          }

          // Push raw emotion into buffer
          emotionBufferRef.current.push(picked);
          if (emotionBufferRef.current.length > EMOTION_BUFFER_SIZE) {
            emotionBufferRef.current.shift();
          }

          // Majority vote — shorter buffer = more responsive
          const counts = new Map<string, number>();
          emotionBufferRef.current.forEach(e => {
            counts.set(e, (counts.get(e) ?? 0) + 1);
          });
          let maxExpr = "neutral";
          let maxCount = 0;
          counts.forEach((val, key) => {
            if (val > maxCount) {
              maxCount = val;
              maxExpr = key;
            }
          });
          expr = maxExpr;

          const expressionEntry = expressions ? Object.entries(expressions).find(([k]) => k === expr) : undefined;
          exprConf = expressionEntry ? expressionEntry[1] : 0;
          exprLabel = getExpressionLabel(expr);
          exprW = getExpressionWeight(expr);

          // ── Face Box (smooth) ──
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const detBox = (detection as any).detection.box;
          const targetBox = {
            x:      (detBox.x / video.videoWidth)  * 100,
            y:      (detBox.y / video.videoHeight) * 100,
            width:  (detBox.width / video.videoWidth)  * 100,
            height: (detBox.height / video.videoHeight) * 100,
          };

          if (!boxBufferRef.current) {
            boxBufferRef.current = targetBox;
          } else {
            const α = 0.25; // slightly faster tracking
            boxBufferRef.current = {
              x:      boxBufferRef.current.x      * (1 - α) + targetBox.x      * α,
              y:      boxBufferRef.current.y      * (1 - α) + targetBox.y      * α,
              width:  boxBufferRef.current.width  * (1 - α) + targetBox.width  * α,
              height: boxBufferRef.current.height * (1 - α) + targetBox.height * α,
            };
          }
          box = boxBufferRef.current;

          // ── Posture ──
          let instantP: NeuralStats["postureState"] = "neutral";
          const faceFrac = detBox.width / video.videoWidth;
          if (faceFrac > 0.30) instantP = "leaning_in";
          else if (faceFrac < 0.14) instantP = "leaning_back";

          postureBufferRef.current.push(instantP);
          if (postureBufferRef.current.length > POSTURE_BUFFER_SIZE) postureBufferRef.current.shift();

          const pCounts = new Map<string, number>();
          postureBufferRef.current.forEach(p => {
            pCounts.set(p, (pCounts.get(p) ?? 0) + 1);
          });
          let maxPosture = "neutral";
          let maxPCount = 0;
          pCounts.forEach((val, key) => {
            if (val > maxPCount) {
              maxPCount = val;
              maxPosture = key;
            }
          });
          pState = maxPosture as NeuralStats["postureState"];
          pWeight = pState === "leaning_in" ? 2 : pState === "leaning_back" ? -2 : 0;

        } else {
          noFaceCountRef.current++;
          if (noFaceCountRef.current > DISTRACTION_THRESHOLD) {
            // Clear buffers when face is definitively gone
            emotionBufferRef.current = [];
            boxBufferRef.current = null;
          }
        }

        const gWeight = gesture ? getGestureWeight(gesture) : 0;
        const facePresent = noFaceCountRef.current < DISTRACTION_THRESHOLD;
        const presWeight = facePresent ? 2.5 : -3.5;
        const raw = exprW + presWeight + gWeight + pWeight;
        const norm = Math.max(0, Math.min(10, raw + 5));

        // ── Score Smoothing ──
        scoreBufferRef.current.push(norm);
        if (scoreBufferRef.current.length > 6) scoreBufferRef.current.shift();
        const avgScore = scoreBufferRef.current.reduce((a, b) => a + b, 0) / scoreBufferRef.current.length;

        setStats({
          score:              Math.round(avgScore * 10) / 10,
          expression:         expr,
          expressionLabel:    exprLabel,
          expressionConfidence: Math.round(exprConf * 100),
          faceDetected:       facePresent,
          handDetected,
          gesture,
          gestureLabel:       gesture ? getGestureLabel(gesture) : "—",
          sentiment:          0,
          box,
          postureState:       pState,
          breakdown: {
            expression: Math.round(exprW  * 10) / 10,
            sentiment:  Math.round(gWeight * 10) / 10,
            presence:   Math.round((presWeight + pWeight) * 10) / 10,
          },
          detectionQuality:   handsInstance ? "full" : "face_only",
          noFaceSeconds:      Math.floor(noFaceCountRef.current / 10),
        });

      } catch (err) {
        const error = err as Error;
        console.error("[NeuralEngine] Inference error:", err);
        if (frameCountRef.current % 50 === 1) {
          toast.error(`Inference error: ${error.message}`);
        }
      } finally {
        runningRef.current = false;
      }
    };

    // 10fps is enough and keeps CPU sane
    intervalRef.current = setInterval(runInference, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isReady, active, modelsLoadedState]);

  return {
    videoRef,
    stats,
    isReady,
    error: cameraError,
    cameraError,
    stopCamera,
    detectionQuality: detectionQual,
  };
}
