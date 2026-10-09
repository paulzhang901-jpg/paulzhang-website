/** Browser voices have no standardized quality score. Prefer known natural voices, not enumeration order. */
export type EnglishVoice = Pick<SpeechSynthesisVoice, "name" | "lang" | "voiceURI" | "localService" | "default">;
export const ENGLISH_VOICE_STORAGE_KEY = "readAloudEnglishVoiceURI";

const novelty = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|fred|ralph|junior|grandma|grandpa)\b/i;
const natural = /\b(samantha|allison|ava|susan|zoe|nathan|aaron|daniel|serena|kate|oliver|siri|premium|enhanced|natural|neural)\b/i;

export function isEnglishVoice(voice: EnglishVoice): boolean {
  return /^en(?:-|$)/i.test(voice.lang);
}

export function rankEnglishVoices(voices: readonly EnglishVoice[]): EnglishVoice[] {
  return voices.filter(isEnglishVoice).sort((a, b) => {
    const score = (v: EnglishVoice) => {
      const us = /^en[-_]us$/i.test(v.lang);
      const effect = novelty.test(v.name);
      return (effect ? -1000 : 0)
        + (us ? 100 : 0)
        + (natural.test(v.name) ? 70 : 0)
        + (v.localService ? 15 : 0)
        + (v.default ? 5 : 0);
    };
    return score(b) - score(a)
      || a.name.localeCompare(b.name, "en")
      || a.lang.localeCompare(b.lang, "en")
      || a.voiceURI.localeCompare(b.voiceURI, "en");
  });
}

export function chooseEnglishVoice(voices: readonly EnglishVoice[], savedVoiceURI: string | null): EnglishVoice | null {
  const ranked = rankEnglishVoices(voices);
  return ranked.find((v) => v.voiceURI === savedVoiceURI) ?? ranked[0] ?? null;
}
