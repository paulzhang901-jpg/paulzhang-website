"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import type {ContentLanguage} from "@/types/content";

type PlaybackState = "idle" | "playing" | "paused";
type Rate = 1 | 1.5 | 2;
const speeds: Rate[] = [1, 1.5, 2];
const translations = {
  "zh-CN": {play: "朗读文章", pause: "暂停", resume: "继续", restart: "重新开始", speed: "朗读速度"},
  "en-US": {play: "Read Aloud", pause: "Pause", resume: "Resume", restart: "Restart", speed: "Reading speed"},
};

function chunkText(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const sentences = normalized.match(/[^。！？.!?；;]+[。！？.!?；;]*|[^。！？.!?；;]+$/gu) ?? [normalized];
  const chunks: string[] = [];
  let chunk = "";
  for (const sentence of sentences) {
    const fragments = sentence.match(/.{1,160}/gu) ?? [];
    for (const fragment of fragments) {
      if (chunk && chunk.length + fragment.length > 160) {
        chunks.push(chunk.trim());
        chunk = "";
      }
      chunk += fragment;
    }
  }
  if (chunk.trim()) chunks.push(chunk.trim());
  return chunks;
}

export function extractArticleChunks(root: Element, title: string): string[] {
  const chunks = chunkText(title);
  root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,blockquote,li").forEach((node) => {
    if (node.closest("[hidden],[aria-hidden='true'],[data-read-aloud-exclude],nav,aside,button,script")) return;
    if (node.parentElement?.closest("blockquote,li")) return;
    if (typeof window !== "undefined") {
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return;
    }
    chunks.push(...chunkText(node.textContent ?? ""));
  });
  return chunks;
}

export function ReadAloudPlayer({locale, title, contentId}: {locale: ContentLanguage; title: string; contentId: string}) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<PlaybackState>("idle");
  const [rate, setRate] = useState<Rate>(1);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const queue = useRef<string[]>([]);
  const index = useRef(0);
  const epoch = useRef(0);
  const active = useRef(false);
  const rateRef = useRef<Rate>(1);
  const voice = useRef<SpeechSynthesisVoice | null>(null);
  const speakRef = useRef<(token: number) => void>(() => {});
  const labels = translations[locale];

  const cancel = useCallback(() => {
    epoch.current++;
    active.current = false;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    queue.current = [];
    index.current = 0;
    setCurrentChunkIndex(0);
    setState("idle");
  }, []);

  useEffect(() => {
    const supportedNow = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    queueMicrotask(() => setSupported(supportedNow));
    try {
      const stored = Number(localStorage.getItem("readAloudPlaybackRate"));
      if (speeds.includes(stored as Rate)) {
        rateRef.current = stored as Rate;
        queueMicrotask(() => setRate(stored as Rate));
      }
    } catch { /* Private browsing may block storage. */ }
  }, []);

  useEffect(() => {
    if (!supported) return;
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      voice.current = voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase())
        ?? voices.find((v) => v.lang.toLowerCase().split("-")[0] === locale.slice(0, 2))
        ?? null;
    };
    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
  }, [locale, supported]);

  const speakChunk = useCallback((token: number) => {
    if (!active.current || epoch.current !== token) return;
    const text = queue.current[index.current];
    if (!text) {
      active.current = false;
      setState("idle");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = rateRef.current;
    if (voice.current) utterance.voice = voice.current;
    utterance.onend = () => {
      if (token !== epoch.current || !active.current) return;
      index.current++;
      setCurrentChunkIndex(index.current);
      speakRef.current(token);
    };
    utterance.onerror = (event) => {
      if (token !== epoch.current || event.error === "canceled" || event.error === "interrupted") return;
      active.current = false;
      setState("idle");
    };
    window.speechSynthesis.speak(utterance);
  }, [locale]);
  useEffect(() => { speakRef.current = speakChunk; }, [speakChunk]);

  const playFromStart = () => {
    cancel();
    const root = document.getElementById(contentId);
    if (!root) return;
    queue.current = extractArticleChunks(root, title);
    if (!queue.current.length) return;
    active.current = true;
    setState("playing");
    speakChunk(epoch.current);
  };

  const toggle = () => {
    if (state === "idle") { playFromStart(); return; }
    if (state === "playing") {
      window.speechSynthesis.pause();
      setState("paused");
    } else {
      window.speechSynthesis.resume();
      setState("playing");
    }
  };

  const setSpeed = (speed: Rate) => {
    rateRef.current = speed;
    setRate(speed);
    try { localStorage.setItem("readAloudPlaybackRate", String(speed)); } catch { /* Optional setting. */ }
    if (state === "idle") return;
    const paused = state === "paused";
    epoch.current++;
    window.speechSynthesis.cancel();
    active.current = true;
    setState("playing");
    speakChunk(epoch.current);
    if (paused) {
      window.speechSynthesis.pause();
      setState("paused");
    }
  };

  useEffect(() => () => {
    epoch.current++;
    active.current = false;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [contentId, locale]);

  useEffect(() => {
    const stopOnNavigation = () => cancel();
    window.addEventListener("pagehide", stopOnNavigation);
    window.addEventListener("popstate", stopOnNavigation);
    return () => {
      window.removeEventListener("pagehide", stopOnNavigation);
      window.removeEventListener("popstate", stopOnNavigation);
    };
  }, [cancel]);

  if (!supported) return null;
  const actionLabel = state === "playing" ? labels.pause : state === "paused" ? labels.resume : labels.play;
  return <div data-read-aloud-exclude className="mb-7 flex flex-wrap items-center gap-2 rounded-lg border bg-surface p-3 text-sm">
    <button type="button" onClick={toggle} aria-label={actionLabel} className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      {state === "playing" ? "⏸ " : "▶ "}{actionLabel}
    </button>
    {state !== "idle" ? <button type="button" onClick={playFromStart} aria-label={labels.restart} className="min-h-11 rounded-md border px-3 focus-visible:outline-2 focus-visible:outline-primary">↻ {labels.restart}</button> : null}
    <div role="group" aria-label={labels.speed} className="flex flex-wrap gap-1">
      {speeds.map((speed) => <button key={speed} type="button" aria-pressed={rate === speed} onClick={() => setSpeed(speed)} className={"min-h-11 min-w-11 rounded-md px-2 focus-visible:outline-2 focus-visible:outline-primary " + (rate === speed ? "border border-primary font-semibold text-primary" : "border border-transparent text-muted-foreground hover:border-border")}>{speed}×</button>)}
    </div>
    <span className="sr-only" aria-live="polite">{state} {currentChunkIndex + 1}</span>
  </div>;
}
