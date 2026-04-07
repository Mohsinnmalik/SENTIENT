"use client";
import { useState, useRef, useCallback, useEffect } from "react";

export interface SpeechHook {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  isDenied: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): SpeechHook {
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isDenied, setIsDenied] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) { setIsDenied(true); return; }
    shouldListenRef.current = true;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    recognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: any) => {
      let final = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      if (final) setTranscript(p => p + final);
      setInterimTranscript(interim);
    };

    rec.onerror = (e: any) => {
      if (e.error === "not-allowed") { setIsDenied(true); shouldListenRef.current = false; setIsListening(false); }
    };

    rec.onend = () => {
      setInterimTranscript("");
      if (shouldListenRef.current) {
        try { rec.start(); } catch {}
      } else {
        setIsListening(false);
      }
    };

    try { rec.start(); setIsListening(true); } catch (e) { console.error(e); }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  return { transcript, interimTranscript, isListening, isSupported, isDenied, startListening, stopListening, resetTranscript };
}
