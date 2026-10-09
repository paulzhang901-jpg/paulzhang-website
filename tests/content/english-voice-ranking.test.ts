import assert from "node:assert/strict";
import {test} from "node:test";
import {chooseEnglishVoice, isEnglishVoice, rankEnglishVoices, ENGLISH_VOICE_STORAGE_KEY} from "../../src/components/content/english-voice-ranking";

const voice = (name: string, lang = "en-US", localService = true, isDefault = false) =>
  ({name, lang, voiceURI: name + ":" + lang, localService, default: isDefault});

test("English-only filtering excludes Chinese and unrelated languages", () => {
  assert.equal(isEnglishVoice(voice("Tingting", "zh-CN")), false);
  assert.deepEqual(rankEnglishVoices([voice("Tingting", "zh-CN"), voice("Daniel", "en-GB")]).map((v) => v.name), ["Daniel"]);
});

test("natural US voices outrank novelty, first enumeration order and lower-quality generic voices", () => {
  const sorted = rankEnglishVoices([voice("Zarvox"), voice("Generic US"), voice("Samantha"), voice("Daniel", "en-GB")]);
  assert.equal(sorted[0].name, "Samantha");
  assert.equal(sorted.at(-1)?.name, "Zarvox");
});

test("selection is deterministic and saved choice overrides ranking", () => {
  const voices = [voice("Zoe"), voice("Samantha")];
  assert.equal(chooseEnglishVoice(voices, null)?.name, "Samantha");
  assert.equal(chooseEnglishVoice(voices.toReversed(), null)?.name, "Samantha");
  assert.equal(chooseEnglishVoice(voices, voices[0].voiceURI)?.name, "Zoe");
});

test("missing persisted voice falls back to best available and storage key is stable", () => {
  assert.equal(chooseEnglishVoice([voice("Ava")], "removed-voice")?.name, "Ava");
  assert.equal(chooseEnglishVoice([], null), null);
  assert.equal(ENGLISH_VOICE_STORAGE_KEY, "readAloudEnglishVoiceURI");
});
