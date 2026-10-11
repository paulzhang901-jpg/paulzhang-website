/** Phase 6C.2: trusted-local, offline-only narration foundation. No network or publishing. */
import {constants} from 'node:fs';
import {open, lstat, mkdtemp, readFile, realpath, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {cacheKey, extractNarration, MockToneProvider, sha256, verifyMockWav, voiceConfigHash} from './core.mjs';

export const NARRATION_STATES = Object.freeze(['DRAFT','GENERATED','PENDING_REVIEW','APPROVED','REJECTED','PUBLISHED','STALE']);
export const DEFAULT_COST_POLICY = Object.freeze({productionTtsEnabled:false,costAuthorized:false,maxSpendUsd:0});
export const PILOT_ID = 'article-true-freedom-2026-10-02';
export const PILOT_FILES = Object.freeze({'zh-CN':'content/zh-CN/library/true-freedom.mdx','en-US':'content/en-US/library/true-freedom.mdx'});
const SHA = /^[a-f0-9]{64}$/;
const transitions = Object.freeze({DRAFT:['GENERATED','STALE'],GENERATED:['PENDING_REVIEW','REJECTED','STALE'],PENDING_REVIEW:['APPROVED','REJECTED','STALE'],APPROVED:['PUBLISHED','STALE'],REJECTED:['STALE'],PUBLISHED:['STALE'],STALE:[]});
const inflight = new Set();
const completed = new Map(); // Process-local ephemeral cache; not a durable production cache.

export function assertNoPaidGeneration(policy=DEFAULT_COST_POLICY) {
  if (policy.productionTtsEnabled !== false || policy.costAuthorized !== false || policy.maxSpendUsd !== 0) {
    throw new Error('PRODUCTION TTS DISABLED: no paid generation authorization in Phase 6C.2');
  }
}

export function createNarrationSnapshot(article) {
  if (!article || !article.canonical_id || !['zh-CN','en-US'].includes(article.language) || !article.text || !Array.isArray(article.paragraphs)) throw new Error('Invalid narration source');
  if (article.paragraphs.join('\n\n') !== article.text || sha256(article.text) !== article.article_content_hash) throw new Error('Narration source integrity mismatch');
  return Object.freeze({canonical_id:article.canonical_id,locale:article.language,title:article.title,text:article.text,paragraphs:Object.freeze([...article.paragraphs]),source_sha256:sha256(article.text)});
}

export async function readPilotSnapshot(root,locale) {
  const relative = PILOT_FILES[locale];
  if (!relative) throw new Error('Unsupported pilot locale');
  const canonicalRoot = await realpath(root);
  const target = path.join(canonicalRoot,relative);
  const stat = await lstat(target);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('Unsafe pilot source file');
  const canonicalFile = await realpath(target);
  if (!canonicalFile.startsWith(canonicalRoot+path.sep)) throw new Error('Pilot source escapes repository');
  const handle = await open(target,constants.O_RDONLY | (constants.O_NOFOLLOW || 0));
  let source;
  try {source=await handle.readFile('utf8');} finally {await handle.close();}
  const article=extractNarration(source);
  if (article.canonical_id !== PILOT_ID || article.language !== locale) throw new Error('Pilot canonical identity mismatch');
  return createNarrationSnapshot(article);
}

export function narrationCacheKey(snapshot,config) {
  if (snapshot.locale !== config.language) throw new Error('Narration locale mismatch');
  return cacheKey({canonical_id:snapshot.canonical_id,language:snapshot.locale,article_content_hash:snapshot.source_sha256},config);
}

export function validateNarrationManifest(m) {
  if (!m || typeof m!=='object' || Array.isArray(m)) throw new Error('Invalid narration manifest');
  for(const f of ['schema_version','canonical_id','locale','source_sha256','voice_config_sha256','provider','model','voice','audio_sha256','audio_format','duration','generation_timestamp','review_status','reviewer_identity','approval_timestamp','publication_status','asset_id','version','history']) if (!(f in m)) throw new Error('Missing narration manifest field: '+f);
  if(m.schema_version!==1 || typeof m.canonical_id!=='string' || !/^[a-z0-9][a-z0-9-]{3,120}$/.test(m.canonical_id) || !['zh-CN','en-US'].includes(m.locale)) throw new Error('Invalid narration identity');
  if(!SHA.test(m.source_sha256) || !SHA.test(m.voice_config_sha256) || !SHA.test(m.audio_sha256) || !SHA.test(m.asset_id)) throw new Error('Invalid narration SHA-256');
  if(m.provider!=='mock' || m.model!=='offline-test-tone-v1' || m.voice!=='synthetic-test-tone' || m.audio_format!=='wav') throw new Error('Production narration not authorized');
  if(!Number.isFinite(m.duration) || m.duration<=0 || !Number.isSafeInteger(m.version) || m.version<1 || !Number.isFinite(Date.parse(m.generation_timestamp))) throw new Error('Invalid narration duration/version/time');
  if(!NARRATION_STATES.includes(m.review_status) || !['NOT_PUBLISHED','PUBLISHED'].includes(m.publication_status) || !Array.isArray(m.history)) throw new Error('Invalid narration status');
  if(m.review_status==='PUBLISHED' || m.publication_status==='PUBLISHED') throw new Error('Mock media cannot be published');
  if(m.review_status==='APPROVED' && (!m.reviewer_identity || !m.approval_timestamp || !SHA.test(m.approval_asset_sha256||'') || m.approval_asset_sha256!==m.audio_sha256 || m.approval_source_sha256!==m.source_sha256)) throw new Error('Invalid immutable approval reference');
  if(m.review_status!=='APPROVED' && m.review_status!=='STALE' && (m.approval_timestamp || m.reviewer_identity)) throw new Error('Unexpected approval metadata');
  if(m.history.length===0 || m.history.at(-1).to!==m.review_status) throw new Error('Invalid narration audit history');
  return m;
}

const freezeRecord=(m)=>Object.freeze({...m,history:Object.freeze(m.history.map(e=>Object.freeze({...e})))});

export function transitionNarration(manifest,to,{reviewer,authorizedReviewers=[],sourceSha256,assetSha256,assetBytes,at=new Date().toISOString()}={}) {
  validateNarrationManifest(manifest);
  if(!NARRATION_STATES.includes(to) || !transitions[manifest.review_status].includes(to)) throw new Error('Forbidden narration state transition');
  if(!Number.isFinite(Date.parse(at))) throw new Error('Invalid transition timestamp');
  if(sourceSha256 && sourceSha256!==manifest.source_sha256 && to!=='STALE') throw new Error('Stale narration source');
  if(to==='PUBLISHED') throw new Error('Production publication disabled in Phase 6C.2');
  if(to==='APPROVED') {
    if(typeof reviewer!=='string' || !reviewer || !authorizedReviewers.includes(reviewer)) throw new Error('Unauthorized narration reviewer');
    if(sourceSha256!==manifest.source_sha256 || assetSha256!==manifest.audio_sha256) throw new Error('Approval source/asset mismatch');
    if(verifyMockWav(assetBytes)!==manifest.audio_sha256) throw new Error('Approval asset content hash mismatch');
  }
  const next={...manifest,review_status:to,history:[...manifest.history,{from:manifest.review_status,to,at,actor:to==='APPROVED'?reviewer:'trusted-local-operator'}]};
  if(to==='APPROVED') Object.assign(next,{reviewer_identity:reviewer,approval_timestamp:at,approval_asset_sha256:manifest.audio_sha256,approval_source_sha256:manifest.source_sha256});
  return freezeRecord(validateNarrationManifest(next));
}

export function detectStale(manifest,snapshot) {
  validateNarrationManifest(manifest);
  return manifest.canonical_id!==snapshot.canonical_id || manifest.locale!==snapshot.locale || manifest.source_sha256!==snapshot.source_sha256;
}

/** The only available generator emits a test tone. Caller-owned private temp directory. */
export async function generateOfflineMock({snapshot,config,policy=DEFAULT_COST_POLICY,provider=new MockToneProvider(),version=1}) {
  assertNoPaidGeneration(policy);
  if(config.provider!=='mock' || config.model!=='offline-test-tone-v1' || config.voice!=='synthetic-test-tone' || config.format!=='wav' || config.language!==snapshot.locale) throw new Error('Only offline mock generation is permitted');
  if(!Number.isSafeInteger(version) || version<1) throw new Error('Invalid narration version');
  const key=narrationCacheKey(snapshot,config);
  const jobKey=key+':'+version;
  if(inflight.has(jobKey)) throw new Error('Duplicate narration generation in progress');
  const cached=completed.get(jobKey);
  if(cached) {
    try {
      if(verifyMockWav(await readFile(cached.audioPath))===cached.manifest.audio_sha256) return {...cached,cacheHit:true};
    } catch { /* Missing/corrupt ephemeral asset must not be reused. */ }
    completed.delete(jobKey);
    throw new Error('Cached mock asset missing or corrupt; use a new version');
  }
  inflight.add(jobKey);
  let directory;
  try {
    directory=await mkdtemp(path.join(os.tmpdir(),'paul-narration-private-'));
    const stat=await lstat(directory);
    if(!stat.isDirectory() || stat.mode&0o077 || (typeof process.getuid==='function' && stat.uid!==process.getuid())) throw new Error('Unsafe narration directory permissions');
    const bytes=await provider.generate({article:snapshot,config});
    const audioSha=verifyMockWav(bytes);
    const assetId=sha256(JSON.stringify([key,version,audioSha]));
    const handle=await open(path.join(directory,assetId+'.mock.wav'),'wx',0o600);
    try {await handle.writeFile(bytes);} finally {await handle.close();}
    const manifest=freezeRecord(validateNarrationManifest({schema_version:1,canonical_id:snapshot.canonical_id,locale:snapshot.locale,source_sha256:snapshot.source_sha256,voice_config_sha256:voiceConfigHash(config),provider:'mock',model:config.model,voice:config.voice,audio_sha256:audioSha,audio_format:'wav',duration:0.25,generation_timestamp:new Date().toISOString(),review_status:'GENERATED',reviewer_identity:null,approval_timestamp:null,publication_status:'NOT_PUBLISHED',asset_id:assetId,version,history:[{from:'DRAFT',to:'GENERATED',at:new Date().toISOString(),actor:'trusted-local-operator'}]}));
    const result={manifest,audioPath:path.join(directory,assetId+'.mock.wav'),directory,cacheKey:key,cacheHit:false,cleanup:async()=>{completed.delete(jobKey);await rm(directory,{recursive:true,force:true});}};
    completed.set(jobKey,result);
    return result;
  } catch(error) {if(directory) await rm(directory,{recursive:true,force:true});throw error;} finally {inflight.delete(jobKey);}
}

/** Production storage is deliberately unimplemented; no R2 credentials or writes. */
export class DisabledNarrationStorage {
  async put() {throw new Error('Production narration storage disabled');}
  async publish() {throw new Error('Production narration publication disabled');}
}

export function productionProvider() {throw new Error('Production TTS disabled: interface only, no paid adapter');}
