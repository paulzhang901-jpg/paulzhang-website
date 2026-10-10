/** Pure speech helpers; no browser globals at import time (SSR-safe). */
export type SpeechPlaybackState = "idle" | "loading" | "playing" | "paused" | "completed" | "error";
export type SpeechPlaybackEvent = "request" | "start" | "pause" | "resume" | "complete" | "fail" | "reset";

export function nextSpeechState(state: SpeechPlaybackState, event: SpeechPlaybackEvent): SpeechPlaybackState {
  switch (event) {
    case "request": return "loading";
    case "start": return state === "loading" ? "playing" : state;
    case "pause": return state === "playing" ? "paused" : state;
    case "resume": return state === "paused" ? "playing" : state;
    case "complete": return "completed";
    case "fail": return "error";
    case "reset": return "idle";
  }
}

export function compatibleVoice<T extends Pick<SpeechSynthesisVoice, "lang">>(
  voice: T | null, locale: string,
): T | null {
  if (!voice) return null;
  const language = locale.split("-")[0].toLowerCase();
  return voice.lang.toLowerCase().split(/[-_]/)[0] === language ? voice : null;
}

export function chooseChineseVoice<T extends Pick<SpeechSynthesisVoice, "lang">>(
  voices: readonly T[], locale: string,
): T | null {
  return voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase())
    ?? voices.find((v) => v.lang.toLowerCase().split(/[-_]/)[0] === "zh")
    ?? null;
}

export function speechErrorMessage(locale: string, error?: string): string {
  if (error === "not-allowed") return locale === "zh-CN"
    ? "浏览器未允许朗读，请再次点击播放。" : "Speech was blocked. Tap Play again.";
  if (error === "voice-unavailable" || error === "language-unavailable") return locale === "zh-CN"
    ? "当前语音不可用，请尝试设备默认语音。" : "This voice is unavailable. Try your device's default voice.";
  return locale === "zh-CN"
    ? "朗读未能启动，请重试并检查手机音量或音频输出设备。" : "Speech could not start. Retry and check volume or audio output.";
}

/** On iOS WebKit, avoid cancel() immediately before a fresh, idle speak() call. */
export function needsSpeechQueueReset(active: boolean, speaking: boolean, pending: boolean, paused: boolean): boolean {
  return active || speaking || pending || paused;
}
