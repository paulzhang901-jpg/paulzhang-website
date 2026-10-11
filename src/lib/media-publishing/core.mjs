import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';

export const sha256 = (s) => createHash('sha256').update(s).digest('hex');
export const LOCALES = ['zh-CN', 'en-US'];
export function extractNarration(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source);
  if (!match) throw new Error('MDX frontmatter required');
  const front = match[1];
  const metadata = Object.fromEntries([...front.matchAll(/^(canonical_id|language|title|status):\s*(.*)$/gm)].map((m)=>[m[1],m[2].trim().replace(/^['"]|['"]$/g,'')]));
  if (!metadata.canonical_id || !LOCALES.includes(metadata.language) || !metadata.title || metadata.status !== 'published') throw new Error('Invalid published canonical metadata');
  const blocks = match[2].replace(/\r\n/g,'\n').split(/\n\s*\n/);
  const paragraphs = [];
  for (let block of blocks) {
    block = block.trim();
    if (!block || /^\*\*(文｜|By )/.test(block)) continue;
    if (/^(```|~~~|<|import\s|export\s|\{|!\[|\|)/m.test(block) || /\]\(|\{[^}]+\}|<[^>]+>/.test(block)) throw new Error('Unsupported MDX narration block; human review required');
    if (/^---+$/.test(block)) continue;
    block = block.replace(/^#{1,6}\s+/,'').replace(/\n/g,' ').replace(/\*\*(.*?)\*\*/g,'$1').replace(/\*(.*?)\*/g,'$1').replace(/`([^`]+)`/g,'$1');
    if (block.trim()) paragraphs.push(block.trim());
  }
  if (!paragraphs.length || paragraphs[0] !== metadata.title) throw new Error('Title mismatch or empty article');
  const text = paragraphs.join('\n\n');
  return {...metadata, paragraphs, text, article_content_hash:sha256(text)};
}
export function voiceConfigHash(config) {
  const {provider, model, voice, language, format, instructions='', speed=1} = config;
  if (![provider,model,voice,language,format].every((v)=>typeof v==='string' && v.length)) throw new Error('Incomplete voice config');
  return sha256(JSON.stringify({provider,model,voice,language,format,instructions,speed}));
}
export function cacheKey(article, config) {
  if (article.language !== config.language) throw new Error('Locale mismatch');
  return sha256(JSON.stringify([article.canonical_id,article.language,article.article_content_hash,voiceConfigHash(config)]));
}
export function validateManifest(m) {
  for (const field of ['canonical_id','language','article_content_hash','audio_provider','audio_model','voice','voice_config_hash','generation_status','generation_cost_estimate']) {
    if (!(field in m)) throw new Error('Missing manifest field: '+field);
  }
  if (!LOCALES.includes(m.language) || !/^[a-f0-9]{64}$/.test(m.article_content_hash) || !/^[a-f0-9]{64}$/.test(m.voice_config_hash)) throw new Error('Invalid manifest identity');
  if (!['mock','planned','generated','failed'].includes(m.generation_status) || !Number.isFinite(m.generation_cost_estimate) || m.generation_cost_estimate < 0) throw new Error('Invalid generation status/cost');
  for (const f of ['audio_file_path','video_file_path','subtitle_file_path']) if (m[f] !== null && (typeof m[f] !== 'string' || m[f].includes('..'))) throw new Error('Invalid media path');
  if (m.generation_status === 'generated' && !m.audio_file_path) throw new Error('Generated manifest lacks audio');
  return m;
}
export function assertPaidGenerationAuthorized(config) {
  // Phase 6B hard stop: no paid generation implementation is shipped.
  if (config.provider !== 'mock') throw new Error('PAID GENERATION BLOCKED: provider adapter not authorized in Phase 6B');
  if (config.costAuthorized || config.maxSpendUsd !== 0) throw new Error('Phase 6B requires $0 spending authorization');
}
export async function runMockGeneration({sourcePath,config,outputDirectory,provider}) {
  assertPaidGenerationAuthorized(config);
  const article = extractNarration(await readFile(sourcePath,'utf8'));
  const key = cacheKey(article,config);
  await mkdir(outputDirectory,{recursive:true});
  const manifestPath = path.join(outputDirectory,key+'.json');
  try {
    const existing = validateManifest(JSON.parse(await readFile(manifestPath,'utf8')));
    if (existing.generation_status==='mock' && existing.article_content_hash===article.article_content_hash && existing.voice_config_hash===voiceConfigHash(config)) {
      await readFile(existing.audio_file_path); // stale/missing audio must not count as a hit
      return {cacheHit:true,manifest:existing};
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const bytes = await provider.generate({article,config});
  if (!Buffer.isBuffer(bytes) || bytes.length<44) throw new Error('Mock provider returned invalid audio');
  const audioPath = path.join(outputDirectory,key+'.mock.wav');
  await writeFile(audioPath,bytes);
  const manifest = validateManifest({canonical_id:article.canonical_id,language:article.language,article_content_hash:article.article_content_hash,audio_provider:config.provider,audio_model:config.model,voice:config.voice,voice_config_hash:voiceConfigHash(config),audio_file_path:audioPath,video_file_path:null,subtitle_file_path:null,generation_timestamp:new Date().toISOString(),generation_status:'mock',generation_cost_estimate:0,mock_warning:'TEST TONE ONLY — NOT AI SPEECH'});
  await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  return {cacheHit:false,manifest};
}
export class MockToneProvider {
  async generate() {
    const rate=22050, samples=Math.floor(rate/4);
    const b=Buffer.alloc(44+samples*2);
    b.write('RIFF',0);b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples*2,40);
    for(let i=0;i<samples;i++) b.writeInt16LE(Math.round(Math.sin(2*Math.PI*440*i/rate)*6000),44+i*2);
    return b;
  }
}
