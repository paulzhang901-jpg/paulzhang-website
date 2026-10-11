import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {extractNarration,sha256,cacheKey,voiceConfigHash,validateManifest,assertPaidGenerationAuthorized,runMockGeneration,MockToneProvider} from '../../src/lib/media-publishing/core.mjs';
import {validateSubtitles} from '../../src/lib/media-publishing/subtitles.mjs';
import {createAudioProvider} from '../../src/lib/media-publishing/providers.mjs';
const config={provider:'mock',model:'offline-test-tone-v1',voice:'synthetic-test-tone',language:'zh-CN',format:'mp3',costAuthorized:false,maxSpendUsd:0};
const articlePath='content/zh-CN/library/true-freedom.mdx';

test('approved bilingual MDX sources preserve titles, order, biblical references and stable hashes',async()=>{
 for(const locale of ['zh-CN','en-US']) {
  const source=await readFile(`content/${locale}/library/true-freedom.mdx`,'utf8');
  const a=extractNarration(source);
  assert.equal(a.canonical_id,'article-true-freedom-2026-10-02');
  assert.equal(a.language,locale);
  assert.equal(a.paragraphs[0],locale==='zh-CN'?'真正的自由':'True Freedom');
  assert.ok(a.paragraphs.length>50);
  assert.equal(a.article_content_hash,sha256(a.text));
  assert.deepEqual(extractNarration(source),a);
 }
});
test('content or voice configuration changes invalidate cache',async()=>{
 const article=extractNarration(await readFile(articlePath,'utf8'));
 assert.notEqual(cacheKey(article,config),cacheKey({...article,article_content_hash:sha256('different')},config));
 assert.notEqual(cacheKey(article,config),cacheKey(article,{...config,voice:'other'}));
 assert.equal(voiceConfigHash(config),voiceConfigHash({...config}));
 assert.throws(()=>cacheKey(article,{...config,language:'en-US'}),/Locale mismatch/);
});
test('paid provider blocked even with cost authorization or environment credentials',()=>{
 assert.throws(()=>assertPaidGenerationAuthorized({...config,provider:'openai'}),/PAID GENERATION BLOCKED/);
 assert.throws(()=>assertPaidGenerationAuthorized({...config,costAuthorized:true}),/\$0/);
 assert.throws(()=>assertPaidGenerationAuthorized({...config,maxSpendUsd:2}),/\$0/);
});
test('mock provider emits labeled non-silent WAV, never MP3 or AI narration; cache reuse and retry',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'paul-media-test-'));
 try {
  let count=0;
  const mock=new MockToneProvider();
  const provider={async generate(args){count++;return mock.generate(args);}};
  const params={sourcePath:articlePath,config,outputDirectory:dir,provider};
  const first=await runMockGeneration(params);
  assert.equal(first.cacheHit,false);
  assert.equal(first.manifest.generation_status,'mock');
  assert.match(first.manifest.mock_warning,/NOT AI SPEECH/);
  const bytes=await readFile(first.manifest.audio_file_path);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WAVE');
  assert.notEqual(bytes.readInt16LE(44+300*2),0);
  assert.equal((await runMockGeneration(params)).cacheHit,true);
  assert.equal(count,1);
  assert.equal(validateManifest(first.manifest),first.manifest);
  assert.throws(()=>validateManifest({...first.manifest,article_content_hash:'bad'}),/identity/);
  const failedProvider={async generate(){throw new Error('mock failure');}};
  await assert.rejects(()=>runMockGeneration({...params,config:{...config,voice:'failure'},provider:failedProvider}),/mock failure/);
  const retried=await runMockGeneration({...params,config:{...config,voice:'failure'}});
  assert.equal(retried.cacheHit,false);
 } finally {await rm(dir,{recursive:true,force:true});}
});
test('subtitle validation rejects fabricated or invalid ordering/duration and supports SRT/VTT',()=>{
 const srt='1\n00:00:00,000 --> 00:00:01,500\nHello.\n\n2\n00:00:01,500 --> 00:00:03,000\nWorld.';
 assert.equal(validateSubtitles(srt,{format:'srt',durationSeconds:3,expectedText:'Hello. World.'}).cueCount,2);
 const vtt='WEBVTT\n\n00:00:00.000 --> 00:00:01.500\nHello.\n\n00:00:01.500 --> 00:00:03.000\nWorld.';
 assert.equal(validateSubtitles(vtt,{format:'vtt',durationSeconds:3}).lastEndSeconds,3);
 assert.throws(()=>validateSubtitles(srt,{format:'srt',durationSeconds:2}),/overlong/);
 assert.throws(()=>validateSubtitles(srt.replace('00:00:01,500 --> 00:00:03,000','00:00:01,000 --> 00:00:03,000'),{format:'srt',durationSeconds:3}),/Overlapping/);
 assert.throws(()=>validateSubtitles(srt,{format:'srt',durationSeconds:3,expectedText:'different'}),/differs/);
});

test('OpenAI provider is a disabled offline boundary; no network calls or secrets',async()=>{
  const provider=createAudioProvider({provider:'openai'});
  await assert.rejects(()=>provider.generate(),/DISABLED/);
  assert.ok(createAudioProvider({provider:'mock'}) instanceof MockToneProvider);
  assert.throws(()=>createAudioProvider({provider:'unrecognized'}),/Unsupported/);
});

test('video rendering refuses jobs without measured alignment, before FFmpeg invocation',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'paul-video-test-'));
 try {
  const job=path.join(dir,'job.json');
  await writeFile(job,JSON.stringify({audio:'x.mp3',background:'b.png',subtitles:'s.srt',output:'out.mp4',title:'Test',author:'Paul Zhang',alignmentEvidence:{verified:false,measuredDurationSeconds:1}}));
  const result=spawnSync(process.execPath,['scripts/media-publishing/render-video.mjs',job,'--render'],{encoding:'utf8'});
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/Missing approved video job field|Refusing production\/mock\/unaligned video/);
 } finally {await rm(dir,{recursive:true,force:true});}
});
