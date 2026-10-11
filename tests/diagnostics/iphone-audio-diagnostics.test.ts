import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const component = readFileSync("src/components/diagnostics/iphone-audio-diagnostics.tsx", "utf8");
const route = readFileSync("src/app/(zh)/internal/audio-diagnostics/page.tsx", "utf8");
test("isolated test speech uses browser defaults and direct synchronous speak", () => {
  assert.match(component, /new SpeechSynthesisUtterance\(phrase.text\)/);
  assert.match(component, /synth.speak\(utterance\)/);
  assert.doesNotMatch(component, /utterance.voice\s*=/);
  assert.doesNotMatch(component, /localStorage|rankEnglishVoices/);
});
test("separate same-origin HTML audio with audibility answers", () => {
  assert.match(component, /audio.play\(\)/);
  assert.match(component, /\/audio-diagnostics\/tone.wav/);
  assert.match(component, /I heard the audio/);
  assert.match(component, /I did not hear the audio/);
});
test("route noindex, no logging network calls", () => {
  assert.match(route, /index: false/);
  assert.doesNotMatch(component, /fetch\(|sendBeacon\(|XMLHttpRequest/);
});
