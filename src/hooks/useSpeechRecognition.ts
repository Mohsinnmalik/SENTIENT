"use client";
import { useState, useRef, useCallback, useEffect } from "react";

// --- Type definitions for Web Speech API ---
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (ev: Event) => void;
  onresult: (ev: SpeechRecognitionEvent) => void;
  onerror: (ev: SpeechRecognitionErrorEvent) => void;
  onend: (ev: Event) => void;
  onspeechstart?: (ev: Event) => void;
  onspeechend?: (ev: Event) => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

export type SpeechStatus = "listening" | "paused" | "reconnecting" | "stopped" | "unsupported";

export interface SpeechHook {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  isDenied: boolean;
  status: SpeechStatus;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

const MAX_TRANSCRIPT_CHARS = 10_000;
const SILENCE_RESTART_MS = 8_000; // restart after 8s silence

export function useSpeechRecognition(): SpeechHook {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const [status, setStatus] = useState<SpeechStatus>("stopped");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartAttemptsRef = useRef(0);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const scheduleRestart = useCallback(
    (rec: SpeechRecognition) => {
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(() => {
        if (!shouldListenRef.current) return;
        setStatus("reconnecting");
        try {
          rec.stop(); // will trigger onend → auto-restart
        } catch { /* ignore */ }
      }, SILENCE_RESTART_MS);
    },
    []
  );

  const buildRecognition = useCallback(() => {
    const SR =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setStatus("listening");
      restartAttemptsRef.current = 0;
      scheduleRestart(rec);
    };

    rec.onspeechstart = () => {
      clearSilenceTimer();
      setStatus("listening");
    };

    rec.onspeechend = () => {
      setStatus("paused");
      scheduleRestart(rec);
    };

    rec.onresult = (e: SpeechRecognitionEvent) => {
      clearSilenceTimer();
      setStatus("listening");
      let final = "";
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      if (final) {
        setTranscript((prev) => {
          const next = prev + final;
          return next.length > MAX_TRANSCRIPT_CHARS
            ? next.slice(next.length - MAX_TRANSCRIPT_CHARS)
            : next;
        });
      }
      setInterimTranscript(interim);
      // reset silence timer on any speech
      scheduleRestart(rec);
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setIsDenied(true);
        shouldListenRef.current = false;
        setIsListening(false);
        setStatus("unsupported");
        clearSilenceTimer();
        return;
      }
      // transient errors (network, aborted) — allow onend to restart
      console.warn("Speech recognition error:", e.error);
    };

    rec.onend = () => {
      setInterimTranscript("");
      clearSilenceTimer();

      if (shouldListenRef.current && restartAttemptsRef.current < 50) {
        restartAttemptsRef.current++;
        setStatus("reconnecting");
        // brief delay to prevent tight loops in some browsers
        setTimeout(() => {
          if (!shouldListenRef.current) return;
          try {
            rec.start();
          } catch (startErr) {
            console.error("Failed to restart recognition:", startErr);
            setIsListening(false);
            setStatus("stopped");
          }
        }, 300);
      } else {
        setIsListening(false);
        setStatus("stopped");
      }
    };

    return rec;
  }, [scheduleRestart]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setIsDenied(true);
      setStatus("unsupported");
      return;
    }
    if (shouldListenRef.current) return; // already running
    shouldListenRef.current = true;
    restartAttemptsRef.current = 0;

    const rec = buildRecognition();
    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.error("start() failed:", e);
    }
  }, [isSupported, buildRecognition]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    clearSilenceTimer();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
    setStatus("stopped");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      clearSilenceTimer();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    isDenied,
    status,
    startListening,
    stopListening,
    resetTranscript,
  };
}
