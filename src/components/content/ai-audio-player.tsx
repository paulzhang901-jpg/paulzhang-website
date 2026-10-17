"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import type {ContentLanguage} from "@/types/content";
import {claimNarration, ownsNarration, releaseNarration} from "./narration-playback";

const SPEEDS = [0.75, 1, 1.25, 1.5] as const;
const copy = {
  "zh-CN": {play:"播放 / 继续",pause:"暂停",restart:"重新开始",speed:"播放速度",progress:"进度",download:"下载 MP3",fallback:"改用浏览器朗读",loading:"正在加载音频…",error:"音频暂时无法播放，请重试或改用浏览器朗读。",disclosure:"AI 合成朗读；非张牧师真人录音"},
  "en-US": {play:"Play / Resume",pause:"Pause",restart:"Restart",speed:"Playback speed",progress:"Progress",download:"Download MP3",fallback:"Use browser narration",loading:"Loading audio…",error:"Audio could not play. Retry or choose browser narration.",disclosure:"AI-generated narration; not Paul Zhang’s recorded voice"},
};

export function AiAudioPlayer({src, title, locale = "en-US", onBrowserFallback}: {
  src:string; title:string; locale?:ContentLanguage; onBrowserFallback?:()=>void;
}) {
  const labels = copy[locale];
  const audioRef = useRef<HTMLAudioElement>(null);
  const owner = useRef(Symbol("mp3-narration"));
  const epoch = useRef(0);
  const [playing,setPlaying] = useState(false);
  const [loading,setLoading] = useState(false);
  const [duration,setDuration] = useState(0);
  const [position,setPosition] = useState(0);
  const [speed,setSpeed] = useState<number>(1);
  const [error,setError] = useState(false);
  const stop = useCallback(() => {
    epoch.current++;
    audioRef.current?.pause();
    releaseNarration(owner.current);
    setPlaying(false);setLoading(false);
  },[]);
  useEffect(() => {
    // React clears refs before passive unmount cleanup; retain the mounted node.
    const audio = audioRef.current;
    window.addEventListener("pagehide",stop);
    return () => {window.removeEventListener("pagehide",stop);audio?.pause();stop();};
  },[src,stop]);

  function play() {
    const audio=audioRef.current;if(!audio)return;
    setError(false);setLoading(true);
    try {
      claimNarration(owner.current,stop);
      const token=++epoch.current;
      // Keep play() in this tap/click handler; never await a fetch first.
      void audio.play().then(() => {
        if(epoch.current===token)setLoading(false);
      }).catch(() => {
        if(epoch.current!==token)return;
        stop();setError(true);
      });
    } catch {stop();setError(true);}
  }
  function seek(value:number) {
    const audio=audioRef.current;
    if(!audio || !Number.isFinite(duration) || duration<=0)return;
    audio.currentTime=Math.max(0,Math.min(value,duration));setPosition(audio.currentTime);
  }
  return <section data-read-aloud-exclude aria-label={`${labels.disclosure}: ${title}`} className="mb-7 w-full max-w-full rounded-lg border p-4">
    <p className="mb-2 font-semibold">{labels.disclosure} · {title}</p>
    <audio ref={audioRef} src={src} preload="metadata"
      onLoadedMetadata={(event)=>setDuration(Number.isFinite(event.currentTarget.duration)?event.currentTarget.duration:0)}
      onTimeUpdate={(event)=>setPosition(event.currentTarget.currentTime)}
      onPlay={()=>{if(!ownsNarration(owner.current)){audioRef.current?.pause();return;}setPlaying(true);}}
      onPause={()=>setPlaying(false)} onEnded={stop}
      onWaiting={()=>setLoading(true)} onPlaying={()=>setLoading(false)} onSeeked={()=>setLoading(false)}
      onError={()=>{stop();setError(true);}} />
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={()=>playing?stop():play()} aria-label={playing?labels.pause:labels.play} className="min-h-11 rounded border px-4 py-3">{playing?labels.pause:labels.play}</button>
      <button type="button" onClick={()=>{seek(0);play();}} className="min-h-11 rounded border px-4 py-3">{labels.restart}</button>
      <label className="flex items-center gap-2">{labels.speed}<select aria-label={labels.speed} value={speed}
        onChange={(event)=>{const value=Number(event.target.value);setSpeed(value);if(audioRef.current)audioRef.current.playbackRate=value;}}
        className="min-h-11 rounded border p-2">{SPEEDS.map(value=><option key={value} value={value}>{value}×</option>)}</select></label>
      <a href={src} download className="inline-flex min-h-11 items-center rounded border px-4 py-3">{labels.download}</a>
    </div>
    <label className="mt-3 block">{labels.progress}<input className="w-full" type="range" min={0} max={duration||1} step={0.1}
      value={Math.min(position,duration||1)} disabled={!duration} aria-label={labels.progress} onChange={(event)=>seek(Number(event.target.value))}/></label>
    <p aria-live="polite">{loading?labels.loading+" ":""}{Math.floor(position)} / {Math.floor(duration)}</p>
    {error && <div><p role="alert">{labels.error}</p>{onBrowserFallback && <button type="button" className="min-h-11 rounded border px-4 py-3"
      onClick={()=>{stop();onBrowserFallback();}}>{labels.fallback}</button>}</div>}
  </section>;
}
