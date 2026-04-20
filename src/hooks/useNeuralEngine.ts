"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";

interface NeuralStats {
  score: number;
  expression: string;
  faceDetected: boolean;
  handDetected: boolean;
  sentiment: number;
  box: { x: number; y: number; width: number; height: number } | null;
  breakdown: {
    expression: number;
    sentiment: number;
    presence: number;
  };
}

// Global singletons for models and state to share between full analyzer and mini portal
let modelsLoaded = false;
let globalStream: MediaStream | null = null;
let handsInstance: any = null;

export function useNeuralEngine(active: boolean = false) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<NeuralStats>({
    score: 0,
    expression: "Neutral",
    faceDetected: false,
    handDetected: false,
    sentiment: 0,
    box: null,
    breakdown: { expression: 0, sentiment: 0, presence: 0 }
  });

  const handsDetectedRef = useRef(false);
  const runningRef = useRef(false);

  // Initialize models and camera
  useEffect(() => {
    if (!active) return;

    async function init() {
      try {
        if (!modelsLoaded) {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
            faceapi.nets.faceExpressionNet.loadFromUri("/models"),
          ]);
          modelsLoaded = true;

          const { Hands } = await import("@mediapipe/hands");
          handsInstance = new Hands({
            locateFile: (file) => `/mediapipe/hands/${file}`,
          });
          handsInstance.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
          handsInstance.onResults((results: any) => {
            handsDetectedRef.current = results.multiHandLandmarks?.length > 0;
          });
        }

        if (!globalStream) {
          globalStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
          });
        }

        if (videoRef.current && !videoRef.current.srcObject) {
          videoRef.current.srcObject = globalStream;
        }

        setIsReady(true);
      } catch (err: any) {
        console.error("Neural Engine Init Failure:", err);
        setError(err.message || "Hardware mismatch");
      }
    }

    init();
  }, [active]);

  // Detection loop
  useEffect(() => {
    if (!isReady || !active) return;

    const interval = setInterval(async () => {
      if (runningRef.current || !videoRef.current || videoRef.current.readyState < 3) return;
      runningRef.current = true;

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }))
          .withFaceExpressions();

        if (handsInstance) {
          await handsInstance.send({ image: videoRef.current });
        }

        const handDetected = handsDetectedRef.current;
        let expr = "Neutral";
        let exprValue = 0;
        let box = null;

        if (detection) {
          const sorted = Object.entries(detection.expressions).sort((a,b) => b[1] - a[1]);
          expr = sorted[0][0];
          
          if (expr === 'happy') exprValue = 2.0;
          else if (expr === 'surprised') exprValue = 1.0;
          else if (expr === 'sad' || expr === 'angry') exprValue = -2.0;

          const video = videoRef.current;
          const { x, y, width, height } = detection.detection.box;
          box = {
            x: (x / video.videoWidth) * 100,
            y: (y / video.videoHeight) * 100,
            width: (width / video.videoWidth) * 100,
            height: (height / video.videoHeight) * 100
          };
        }

        const presence = detection ? 1.0 : 0;
        const rawScore = 5.0 + exprValue + presence + (handDetected ? 0.5 : 0);
        
        setStats(prev => {
          const alpha = 0.3;
          const smoothed = prev.score === 0 ? rawScore : (prev.score * (1 - alpha)) + (rawScore * alpha);
          return {
            score: Math.min(10, Math.max(0, smoothed)),
            expression: expr,
            faceDetected: !!detection,
            handDetected,
            sentiment: 0,
            box,
            breakdown: { expression: exprValue, sentiment: 0, presence }
          };
        });

      } catch (err) {
        console.error("Detection error:", err);
      } finally {
        runningRef.current = false;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady, active]);

  return { videoRef, stats, isReady, error };
}
