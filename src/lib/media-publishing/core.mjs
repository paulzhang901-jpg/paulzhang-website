import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir, open, unlink} from 'node:fs/promises';
import path from 'node:path';

export const sha256 = (s) => createHash('sha256').update(s).digest('hex');
export const LOCALES = ['zh-CN', 'en-US'];
export function verifyMockWav(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 46 || bytes.toString('ascii',0,4)!=='RIFF' || bytes.toString('ascii',8,12)!=='WAVE' || bytes.toString('ascii',12,16)!=='fmt ' || bytes.toString('ascii',36,40)!=='data' || bytes.readUInt32LE(4)!==bytes.length-8 || bytes.readUInt32LE(40)!==bytes.length-44 || bytes.readUInt16LE(20)!==1 || bytes.readUInt16LE(22)!==1 || bytes.readUInt16LE(34)!==16 || (bytes.length-44)%2!==0) throw new Error('Invalid or incomplete mock WAV');
  if (!bytes.subarray(44).some(v=>v!==0)) throw new Error('Silent mock WAV');
  return sha256(bytes);
}
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
  for (const field of ['canonical_id','language','article_content_hash','audio_provider','audio_model','voice','voice_config_hash','generation_status','generation_cost_estimate','audio_format','audio_sha256']) {
    if (!(field in m)) throw new Error('Missing manifest field: '+field);
  }
  if (!LOCALES.includes(m.language) || !/^[a-f0-9]{64}$/.test(m.article_content_hash) || !/^[a-f0-9]{64}$/.test(m.voice_config_hash)) throw new Error('Invalid manifest identity');
  if (!['mock','planned','generated','failed'].includes(m.generation_status) || !Number.isFinite(m.generation_cost_estimate) || m.generation_cost_estimate < 0) throw new Error('Invalid generation status/cost');
  if (!['wav','mp3'].includes(m.audio_format) || !/^[a-f0-9]{64}$/.test(m.audio_sha256)) throw new Error('Invalid audio format/hash');
  if (m.generation_status==='mock' && (m.audio_provider!=='mock' || m.audio_format!=='wav' || !m.mock_warning || !m.audio_file_path?.endsWith('.mock.wav'))) throw new Error('Mock audio cannot be production narration');
  if (m.generation_status==='generated' && (m.audio_provider==='mock' || m.audio_format!=='mp3' || m.mock_warning)) throw new Error('Invalid production narration');
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
  if (config.format!=='wav') throw new Error('Mock audio requires WAV format');
  const article = extractNarration(await readFile(sourcePath,'utf8'));
  const key = cacheKey(article,config);
  await mkdir(outputDirectory,{recursive:true});
  const manifestPath = path.join(outputDirectory,key+'.json');
  const lockPath = path.join(outputDirectory,key+'.lock');
  let lock;
  try {lock=await open(lockPath,'wx');} catch(e) {if(e.code==='EEXIST') throw new Error('Generation already in progress');throw e;}
  try {
  try {
    const existing = validateManifest(JSON.parse(await readFile(manifestPath,'utf8')));
    if (existing.generation_status==='mock' && existing.canonical_id===article.canonical_id && existing.language===article.language && existing.article_content_hash===article.article_content_hash && existing.audio_provider===config.provider && existing.audio_model===config.model && existing.voice===config.voice && existing.voice_config_hash===voiceConfigHash(config) && existing.audio_format===config.format && existing.audio_file_path===path.join(outputDirectory,key+'.mock.wav')) {
      if (verifyMockWav(await readFile(existing.audio_file_path))!==existing.audio_sha256) throw new Error('Corrupted cached audio');
      return {cacheHit:true,manifest:existing};
    }
  } catch (error) { if (error.code !== 'ENOENT' && !(error instanceof SyntaxError) && !/Corrupted cached audio|Invalid .*|Missing manifest/.test(error.message)) throw error; }
  const bytes = await provider.generate({article,config});
  const audioHash=verifyMockWav(bytes);
  const audioPath = path.join(outputDirectory,key+'.mock.wav');
  const manifest = validateManifest({canonical_id:article.canonical_id,language:article.language,article_content_hash:article.article_content_hash,audio_provider:config.provider,audio_model:config.model,voice:config.voice,voice_config_hash:voiceConfigHash(config),audio_format:'wav',audio_sha256:audioHash,audio_file_path:audioPath,video_file_path:null,subtitle_file_path:null,generation_timestamp:new Date().toISOString(),generation_status:'mock',generation_cost_estimate:0,mock_warning:'TEST TONE ONLY — NOT AI SPEECH'});
  await writeFile(audioPath+'.tmp',bytes);
  await (await import('node:fs/promises')).rename(audioPath+'.tmp',audioPath);
  await writeFile(manifestPath+'.tmp',JSON.stringify(manifest,null,2)+'\n');
  await (await import('node:fs/promises')).rename(manifestPath+'.tmp',manifestPath);
  return {cacheHit:false,manifest};
  } finally {await lock.close();await unlink(lockPath);}
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
