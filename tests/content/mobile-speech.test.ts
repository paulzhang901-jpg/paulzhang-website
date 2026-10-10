import assert from "node:assert/strict";
import {test} from "node:test";
import {chooseChineseVoice, compatibleVoice, nextSpeechState, speechErrorMessage} from "../../src/components/content/mobile-speech";
import {chooseEnglishVoice, rankEnglishVoices} from "../../src/components/content/english-voice-ranking";

const voice = (lang: string, name = "System") => ({lang, name, voiceURI: name + lang, localService: true, default: false});

test("mobile initialization tolerates empty voice list and browser default", () => {
  assert.equal(chooseChineseVoice([], "zh-CN"), null);
  assert.equal(chooseEnglishVoice([], "saved-desktop-voice"), null);
  assert.equal(compatibleVoice(null, "en-US"), null);
});
test("delayed voiceschanged can select a compatible voice after empty initialization", () => {
  const first = chooseEnglishVoice([], null);
  const later = chooseEnglishVoice(rankEnglishVoices([voice("en-US", "Ava")]), null);
  assert.equal(first, null);
  assert.equal(later?.name, "Ava");
});
test("missing desktop preference falls back to mobile voice", () => {
  assert.equal(chooseEnglishVoice([voice("en-GB", "Mobile")], "Samantha:en-US")?.name, "Mobile");
  assert.equal(compatibleVoice(voice("zh-CN"), "en-US"), null);
});
test("Chinese initialization prefers Mandarin, then Chinese fallback", () => {
  assert.equal(chooseChineseVoice([voice("zh-TW"), voice("zh-CN")], "zh-CN")?.lang, "zh-CN");
  assert.equal(chooseChineseVoice([voice("zh-TW")], "zh-CN")?.lang, "zh-TW");
});
test("English initialization filters incompatible voices", () => {
  assert.equal(chooseEnglishVoice([voice("zh-CN"), voice("en-US")], null)?.lang, "en-US");
});
test("speech state requires onstart, supports pause/resume/restart and completion", () => {
  assert.equal(nextSpeechState("idle", "request"), "loading");
  assert.equal(nextSpeechState("loading", "start"), "playing");
  assert.equal(nextSpeechState("playing", "pause"), "paused");
  assert.equal(nextSpeechState("paused", "resume"), "playing");
  assert.equal(nextSpeechState("playing", "complete"), "completed");
  assert.equal(nextSpeechState("completed", "request"), "loading");
});
test("error transitions to retryable state and provides localized feedback", () => {
  assert.equal(nextSpeechState("loading", "fail"), "error");
  assert.equal(nextSpeechState("error", "request"), "loading");
  assert.match(speechErrorMessage("en-US", "not-allowed"), /blocked/i);
  assert.match(speechErrorMessage("zh-CN", "voice-unavailable"), /语音/);
});
test("no autoplay: initial state remains idle until request", () => {
  assert.equal(nextSpeechState("idle", "start"), "idle");
  assert.equal(nextSpeechState("idle", "reset"), "idle");
});
test("unmount cleanup resets playback state", () => {
  assert.equal(nextSpeechState("playing", "reset"), "idle");
});
test("desktop natural voice preference remains available", () => {
  assert.equal(chooseEnglishVoice([voice("en-US", "Zarvox"), voice("en-US", "Samantha")], null)?.name, "Samantha");
});
