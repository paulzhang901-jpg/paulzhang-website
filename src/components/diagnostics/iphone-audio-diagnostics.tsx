"use client";

import {useEffect, useRef, useState} from "react";

type TestName = "English TTS" | "Chinese TTS" | "HTML5 audio";
type Hearing = "heard" | "not heard" | "unknown";
type LogEntry = {time: string; test: TestName; event: string; result: string; details?: string};
type TestStatus = "PASS" | "FAIL" | "UNKNOWN";
const tests: TestName[] = ["English TTS", "Chinese TTS", "HTML5 audio"];
const phrases = {
  "English TTS": {text: "Hello. This is an English audio test.", lang: "en-US"},
  "Chinese TTS": {text: "你好，这是中文语音测试。", lang: "zh-CN"},
};
export function diagnosticStatus(hearing: Hearing): TestStatus {
  return hearing === "heard" ? "PASS" : hearing === "not heard" ? "FAIL" : "UNKNOWN";
}
function audioSnapshot(audio: HTMLAudioElement) {
  return "currentTime=" + audio.currentTime.toFixed(2) + " volume=" + audio.volume
    + " muted=" + audio.muted + " readyState=" + audio.readyState + " networkState=" + audio.networkState;
}
function speechSnapshot(synth: SpeechSynthesis) {
  return "speaking=" + synth.speaking + " pending=" + synth.pending + " paused=" + synth.paused;
}

export function IphoneAudioDiagnostics() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [hearing, setHearing] = useState<Record<TestName, Hearing>>({
    "English TTS": "unknown", "Chinese TTS": "unknown", "HTML5 audio": "unknown",
  });
  const [copyResult, setCopyResult] = useState("");
  const [busy, setBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mounted = useRef(true);
  const log = (test: TestName, event: string, result: string, details?: string) => {
    if (!mounted.current) return;
    setEntries((old) => [...old, {time: new Date().toISOString(), test, event, result, details}].slice(-250));
  };
  useEffect(() => {
    mounted.current = true;
    const audio = audioRef.current;
    return () => {
      mounted.current = false;
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
      audio?.pause();
    };
  }, []);

  function runSpeech(test: "English TTS" | "Chinese TTS") {
    // The utterance and speak() must remain synchronous in this actual click handler.
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      log(test, "availability", "FAIL", "SpeechSynthesis API unavailable");
      return;
    }
    const synth = window.speechSynthesis;
    let voices = -1;
    try { voices = synth.getVoices().length; } catch (error) {
      log(test, "getVoices", "FAIL", String(error));
    }
    log(test, "availability", "PASS", "speechSynthesis=true voiceCount=" + voices + " " + speechSnapshot(synth));
    if (synth.speaking || synth.pending || synth.paused) {
      synth.cancel();
      log(test, "cancel existing speech", "INFO", speechSnapshot(synth));
    }
    const phrase = phrases[test];
    const utterance = new SpeechSynthesisUtterance(phrase.text);
    utterance.lang = phrase.lang;
    // Intentionally leave utterance.voice unset, independent of player voice ranking/preferences.
    utteranceRef.current = utterance;
    utterance.onstart = () => log(test, "onstart", "EVENT — audibility unconfirmed", speechSnapshot(synth));
    utterance.onend = () => { log(test, "onend", "EVENT — audibility unconfirmed", speechSnapshot(synth)); utteranceRef.current = null; };
    utterance.onerror = (event) => {
      log(test, "onerror", "FAIL", "error=" + event.error + " " + speechSnapshot(synth));
      utteranceRef.current = null;
    };
    try {
      synth.speak(utterance);
      log(test, "speak() invoked", "INFO — not proof of sound", speechSnapshot(synth));
    } catch (error) {
      log(test, "speak() exception", "FAIL", String(error));
      utteranceRef.current = null;
    }
  }

  function runAudio() {
    const audio = audioRef.current;
    if (!audio) { log("HTML5 audio", "element", "FAIL", "Audio element unavailable"); return; }
    try {
      audio.currentTime = 0;
      const promise = audio.play(); // Direct click, no await before play.
      log("HTML5 audio", "play() invoked", "INFO", audioSnapshot(audio));
      if (promise && typeof promise.then === "function") {
        void promise.then(() => log("HTML5 audio", "play() Promise", "RESOLVED — audibility unconfirmed", audioSnapshot(audio)))
          .catch((error: unknown) => log("HTML5 audio", "play() Promise", "REJECTED", String(error)));
      }
    } catch (error) { log("HTML5 audio", "play() exception", "FAIL", String(error)); }
  }
  const report = [
    "iPhone Audio Diagnostics — local report",
    "Created: " + new Date().toISOString(),
    "Browser: " + (typeof navigator === "undefined" ? "unavailable" : navigator.userAgent),
    ...tests.map((test) => test + ": " + diagnosticStatus(hearing[test]) + " (manual: " + hearing[test] + ")"),
    "",
    ...entries.map((entry) => [entry.time, entry.test, entry.event, entry.result, entry.details ?? ""].join(" | ")),
  ].join("\n");
  async function copyReport() {
    try { await navigator.clipboard.writeText(report); setCopyResult("Copied locally. Nothing was uploaded."); }
    catch { setCopyResult("Clipboard unavailable. Select and copy the report below."); }
  }
  return (
    <main className="mx-auto w-full max-w-2xl min-w-0 px-4 py-8 text-sm leading-relaxed">
      <h1 className="mb-3 text-2xl font-semibold">iPhone Audio Diagnostics</h1>
      <p className="mb-5">Unlisted public test page. Nothing is uploaded. Onstart and play() success do not prove audible sound; confirm what you actually hear.</p>
      <div className="space-y-5">
        {tests.map((test) => (
          <section key={test} className="min-w-0 rounded-xl border p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{test}</h2>
              <strong aria-live="polite">{diagnosticStatus(hearing[test])}</strong>
            </div>
            <button className="mb-4 min-h-12 w-full rounded-lg border bg-slate-900 px-4 py-3 font-medium text-white"
              onClick={() => test === "HTML5 audio" ? runAudio() : runSpeech(test)}>
              {test === "English TTS" ? "Test English Speech" : test === "Chinese TTS" ? "测试中文语音" : "Test Audio Playback"}
            </button>
            <fieldset>
              <legend className="mb-2 font-medium">Did you hear the audio?</legend>
              <div className="flex flex-col gap-2 sm:flex-row">
                {(["heard", "not heard"] as const).map((answer) => (
                  <label key={answer} className="flex min-h-11 flex-1 items-center gap-2 rounded-lg border px-3 py-2">
                    <input type="radio" name={test} checked={hearing[test] === answer}
                      onChange={() => { setHearing((old) => ({...old, [test]: answer})); log(test, "manual audibility", answer === "heard" ? "PASS" : "FAIL"); }} />
                    {answer === "heard" ? "I heard the audio" : "I did not hear the audio"}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
        ))}
      </div>
      <audio ref={audioRef} src="/audio-diagnostics/tone.wav" preload="metadata"
        onLoadedMetadata={(e) => log("HTML5 audio", "loadedmetadata", "EVENT", audioSnapshot(e.currentTarget))}
        onCanPlay={(e) => log("HTML5 audio", "canplay", "EVENT", audioSnapshot(e.currentTarget))}
        onPlaying={(e) => log("HTML5 audio", "playing", "EVENT — audibility unconfirmed", audioSnapshot(e.currentTarget))}
        onPause={(e) => log("HTML5 audio", "pause", "EVENT", audioSnapshot(e.currentTarget))}
        onEnded={(e) => log("HTML5 audio", "ended", "EVENT", audioSnapshot(e.currentTarget))}
        onError={(e) => log("HTML5 audio", "error", "FAIL", "mediaError=" + (e.currentTarget.error?.code ?? "unknown") + " " + audioSnapshot(e.currentTarget))}
      />
      <section className="mt-7 rounded-xl border p-4">
        <h2 className="mb-2 text-lg font-semibold">Device audio checklist</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Increase iPhone media volume.</li>
          <li>Disconnect Bluetooth or verify the selected audio output.</li>
          <li>Confirm videos or music can produce sound.</li>
          <li>Test both Safari and Chrome on this iPhone.</li>
          <li>If TTS fails, inspect iPhone Accessibility → Spoken Content settings.</li>
        </ol>
      </section>
      <section className="mt-7 min-w-0 rounded-xl border p-4">
        <h2 className="mb-3 text-lg font-semibold">Local event log</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          <button className="min-h-11 rounded-lg border px-4" onClick={() => { setEntries([]); setCopyResult(""); }}>Clear Log</button>
          <button className="min-h-11 rounded-lg border px-4" onClick={() => { if (!busy) { setBusy(true); void copyReport().finally(() => setBusy(false)); } }} disabled={busy}>Copy Diagnostic Report</button>
        </div>
        <p role="status">{copyResult}</p>
        <textarea aria-label="Diagnostic report" className="mt-2 h-64 w-full min-w-0 rounded-lg border p-2 font-mono text-xs" readOnly value={report} />
      </section>
    </main>
  );
}
