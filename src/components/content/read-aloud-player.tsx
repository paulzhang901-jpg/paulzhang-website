"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import type {ContentLanguage} from "@/types/content";
import {chooseEnglishVoice, ENGLISH_VOICE_STORAGE_KEY, rankEnglishVoices} from "./english-voice-ranking";
import {chooseChineseVoice, compatibleVoice, needsSpeechQueueReset, nextSpeechState, speechErrorMessage, type SpeechPlaybackState} from "./mobile-speech";

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
  const [state, setState] = useState<SpeechPlaybackState>("idle");
  const [rate, setRate] = useState<Rate>(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const queue = useRef<string[]>([]);
  const index = useRef(0);
  const epoch = useRef(0);
  const active = useRef(false);
  const rateRef = useRef<Rate>(1);
  const voice = useRef<SpeechSynthesisVoice | null>(null);
  const [englishVoices, setEnglishVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [englishVoiceURI, setEnglishVoiceURI] = useState("");
  const preferredEnglishVoiceURI = useRef<string | null>(null);
  const speakRef = useRef<(token: number) => void>(() => {});
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearWatchdog = () => { if (watchdog.current !== null) { clearTimeout(watchdog.current); watchdog.current = null; } };
  const labels = translations[locale];

  const cancel = useCallback(() => {
    epoch.current++;
    active.current = false;
    clearWatchdog();
    setErrorMessage("");
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
    if (locale === "en-US") {
      try { preferredEnglishVoiceURI.current = localStorage.getItem(ENGLISH_VOICE_STORAGE_KEY); }
      catch { preferredEnglishVoiceURI.current = null; }
    }
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (locale === "en-US") {
        const ranked = rankEnglishVoices(voices);
        const selected = chooseEnglishVoice(ranked, preferredEnglishVoiceURI.current);
        voice.current = compatibleVoice(voices.find((v) => v.voiceURI === selected?.voiceURI) ?? null, locale);
        queueMicrotask(() => {
          setEnglishVoices(ranked as SpeechSynthesisVoice[]);
          setEnglishVoiceURI(selected?.voiceURI ?? "");
        });
      } else {
        // Preserve the existing, user-verified Chinese voice selection unchanged.
        voice.current = chooseChineseVoice(voices, locale);
      }
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
      clearWatchdog();
      setState("completed");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    let receivedSpeechEvent = false;
    utterance.lang = locale;
    utterance.rate = rateRef.current;
    utterance.pitch = 1;
    utterance.volume = 1;
    // Mobile browsers can return an empty or delayed voice list; omit voice to use the native default.
    const selectedVoice = compatibleVoice(voice.current, locale);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onstart = () => {
      receivedSpeechEvent = true;
      if (token !== epoch.current || !active.current) return;
      clearWatchdog();
      setState((previous) => nextSpeechState(previous, "start"));
    };
    utterance.onend = () => {
      receivedSpeechEvent = true;
      if (token !== epoch.current || !active.current) return;
      clearWatchdog();
      index.current++;
      setCurrentChunkIndex(index.current);
      speakRef.current(token);
    };
    utterance.onerror = (event) => {
      receivedSpeechEvent = true;
      if (token !== epoch.current || !active.current) return;
      clearWatchdog();
      active.current = false;
      setErrorMessage(speechErrorMessage(locale, event.error));
      setState("error");
    };
    try {
      window.speechSynthesis.speak(utterance);
      // A missing onstart/onerror is possible on mobile; avoid an indefinite loading indicator.
      clearWatchdog();
      if (!receivedSpeechEvent) watchdog.current = setTimeout(() => {
        if (token !== epoch.current || !active.current) return;
        active.current = false;
        window.speechSynthesis.cancel();
        setErrorMessage(speechErrorMessage(locale));
        setState("error");
      }, 10000);
    } catch {
      clearWatchdog();
      active.current = false;
      setErrorMessage(speechErrorMessage(locale));
      setState("error");
    }
  }, [locale]);
  useEffect(() => { speakRef.current = speakChunk; }, [speakChunk]);

  const playFromStart = () => {
    // Keep the first speak() synchronous with the user click for iOS user activation.
    // Avoid cancel() on an idle iOS WebKit engine immediately before speak().
    // Invalidate old callbacks without touching the engine unless a queue is active.
    const synth = window.speechSynthesis;
    const shouldReset = needsSpeechQueueReset(active.current, synth.speaking, synth.pending, synth.paused);
    epoch.current++;
    active.current = false;
    clearWatchdog();
    setErrorMessage("");
    if (shouldReset) synth.cancel();
    queue.current = [];
    index.current = 0;
    setCurrentChunkIndex(0);
    const root = document.getElementById(contentId);
    if (!root) return;
    queue.current = extractArticleChunks(root, title);
    if (!queue.current.length) return;
    active.current = true;
    setState("loading");
    speakChunk(epoch.current);
  };

  const toggle = () => {
    if (state === "idle" || state === "completed" || state === "error") { playFromStart(); return; }
    if (state === "loading") return;
    if (state === "playing") {
      window.speechSynthesis.pause();
      setState("paused");
    } else {
      window.speechSynthesis.resume();
      setState("playing");
    }
  };

  const selectEnglishVoice = (uri: string) => {
    const selected = englishVoices.find((v) => v.voiceURI === uri);
    if (!selected) return;
    preferredEnglishVoiceURI.current = uri;
    voice.current = selected;
    setEnglishVoiceURI(uri);
    try { localStorage.setItem(ENGLISH_VOICE_STORAGE_KEY, uri); } catch { /* Storage may be unavailable. */ }
    if (state === "idle" || state === "completed" || state === "error") return;
    const paused = state === "paused";
    epoch.current++;
    clearWatchdog();
    window.speechSynthesis.cancel();
    active.current = true;
    setState("loading");
    speakChunk(epoch.current);
    if (paused) {
      window.speechSynthesis.pause();
      setState("paused");
    }
  };

  const setSpeed = (speed: Rate) => {
    rateRef.current = speed;
    setRate(speed);
    try { localStorage.setItem("readAloudPlaybackRate", String(speed)); } catch { /* Optional setting. */ }
    if (state === "idle" || state === "completed" || state === "error") return;
    const paused = state === "paused";
    epoch.current++;
    clearWatchdog();
    window.speechSynthesis.cancel();
    active.current = true;
    setState("loading");
    speakChunk(epoch.current);
    if (paused) {
      window.speechSynthesis.pause();
      setState("paused");
    }
  };

  useEffect(() => () => {
    epoch.current++;
    active.current = false;
    clearWatchdog();
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
    <button type="button" onClick={toggle} disabled={state === "loading"} aria-label={actionLabel} className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      {state === "playing" ? "⏸ " : "▶ "}{state === "loading" ? (locale === "zh-CN" ? "正在启动…" : "Starting…") : actionLabel}
    </button>
    {(state === "playing" || state === "paused" || state === "loading") ? <button type="button" onClick={playFromStart} aria-label={labels.restart} className="min-h-11 rounded-md border px-3 focus-visible:outline-2 focus-visible:outline-primary">↻ {labels.restart}</button> : null}
    {locale === "en-US" && englishVoices.length > 0 ? <label className="flex min-w-0 flex-wrap items-center gap-2">
      <span>Voice</span>
      <select aria-label="English reading voice" value={englishVoiceURI} onChange={(event) => selectEnglishVoice(event.target.value)} className="min-h-11 max-w-full rounded-md border bg-surface px-2 text-foreground focus-visible:outline-2 focus-visible:outline-primary">
        {englishVoices.map((available) => <option key={available.voiceURI} value={available.voiceURI}>{available.name} ({available.lang})</option>)}
      </select>
    </label> : null}
    <div role="group" aria-label={labels.speed} className="flex flex-wrap gap-1">
      {speeds.map((speed) => <button key={speed} type="button" aria-pressed={rate === speed} onClick={() => setSpeed(speed)} className={"min-h-11 min-w-11 rounded-md px-2 focus-visible:outline-2 focus-visible:outline-primary " + (rate === speed ? "border border-primary font-semibold text-primary" : "border border-transparent text-muted-foreground hover:border-border")}>{speed}×</button>)}
    </div>
    <span role="status" aria-live="polite" className="text-muted-foreground">{errorMessage || (state === "loading" ? (locale === "zh-CN" ? "正在启动朗读" : "Starting speech") : state === "playing" ? (locale === "zh-CN" ? "正在朗读" : "Reading") : state === "paused" ? (locale === "zh-CN" ? "已暂停" : "Paused") : state === "completed" ? (locale === "zh-CN" ? "朗读完成" : "Finished") : "")}</span>
    <span className="sr-only">{currentChunkIndex + 1}</span>
  </div>;
}
