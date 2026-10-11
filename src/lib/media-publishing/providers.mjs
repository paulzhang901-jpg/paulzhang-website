import {MockToneProvider} from './core.mjs';

/** @typedef {{ generate(args: {article: object, config: object}): Promise<Buffer> }} AudioGenerationProvider */

/**
 * OpenAI adapter boundary only. No live implementation or API call is authorized
 * in Phase 6B; a later approved phase must select and verify an active model.
 * Credentials may be read only from process.env on the offline server side.
 */
export class OpenAiAudioProvider {
  constructor({environment=process.env}={}) {this.environment=environment;}
  async generate() {
    throw new Error('OPENAI TTS DISABLED: paid generation requires separate approval, model verification and credential configuration');
  }
}

export function createAudioProvider(config) {
  if(config.provider==='mock') return new MockToneProvider();
  if(config.provider==='openai') return new OpenAiAudioProvider();
  throw new Error('Unsupported audio provider');
}
