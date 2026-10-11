"use client";

import {useEffect, useRef, useState} from "react";

const SPEEDS = [0.75, 1, 1.25, 1.5] as const;

/** Isolated reusable component. Not mounted in article pages during Phase 6B. */
export function AiAudioPlayer({src, title}: {src: string; title: string}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const audio = audioRef.current;
    return () => {audio?.pause();};
  }, [src]);

  function play() {
    const audio = audioRef.current;
    if (!audio) return;
    setError("");
    setLoading(true);
    try {
      const promise = audio.play(); // Synchronous user gesture: no await before play().
      void promise.then(() => setLoading(false)).catch((reason: unknown) => {
        setLoading(false);
        setPlaying(false);
        setError("Audio playback was blocked or failed: " + String(reason));
      });
    } catch (reason) {
      setLoading(false);
      setError("Audio playback failed: " + String(reason));
    }
  }
  function restart() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setPosition(0);
    play();
  }
  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(duration) || duration <= 0) return;
    audio.currentTime = Math.max(0, Math.min(value, duration));
    setPosition(audio.currentTime);
  }
  return (
    <section aria-label={`AI narration: ${title}`} className="w-full max-w-full rounded-lg border p-4">
      <p className="mb-2 font-semibold">AI-generated narration · {title}</p>
      <audio ref={audioRef} src={src} preload="metadata"
        onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
        onEnded={() => {setPlaying(false);setLoading(false);}}
        onWaiting={() => setLoading(true)} onPlaying={() => setLoading(false)}
        onError={(event) => {setLoading(false);setPlaying(false);setError("Audio file missing, unsupported, or unavailable (media error " + (event.currentTarget.error?.code ?? "unknown") + ").");}} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => {if(playing) audioRef.current?.pause();else play();}} aria-label={playing?"Pause narration":"Play narration"} className="rounded border px-4 py-3">{playing?"Pause":"Play / Resume"}</button>
        <button type="button" onClick={restart} className="rounded border px-4 py-3">Restart</button>
        <label className="flex items-center gap-2">Speed
          <select value={speed} onChange={(event) => {const v=Number(event.target.value);setSpeed(v);if(audioRef.current)audioRef.current.playbackRate=v;}} aria-label="Playback speed" className="rounded border p-2">
            {SPEEDS.map((v)=><option key={v} value={v}>{v}×</option>)}
          </select>
        </label>
      </div>
      <label className="mt-3 block">Progress
        <input className="w-full" type="range" min={0} max={duration||1} step={0.1} value={Math.min(position,duration||1)} onChange={(event)=>seek(Number(event.target.value))} disabled={!duration} aria-label="Seek narration" />
      </label>
      <p aria-live="polite">{loading?"Loading audio… ":""}{Math.floor(position)} / {Math.floor(duration)} seconds</p>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
