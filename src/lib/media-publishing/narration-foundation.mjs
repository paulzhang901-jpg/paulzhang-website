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
const LOCAL_TRUST = 'SIMULATED_UNVERIFIED';
const transitions = Object.freeze({DRAFT:['GENERATED','STALE'],GENERATED:['PENDING_REVIEW','REJECTED','STALE'],PENDING_REVIEW:['APPROVED','REJECTED','STALE'],APPROVED:['PUBLISHED','STALE'],REJECTED:['STALE'],PUBLISHED:['STALE'],STALE:[]});
const inflight = new Set();
const completed = new Map(); // Process-local ephemeral cache; not a durable production cache.

export function assertNoPaidGeneration(policy=DEFAULT_COST_POLICY) {
  if (policy.productionTtsEnabled !== false || policy.costAuthorized !== false || policy.maxSpendUsd !== 0) {
    throw new Error('PRODUCTION TTS DISABLED: no paid generation authorization in Phase 6C.2');
  }
}

export function createNarrationSnapshot(article) {
  if (!article || typeof article.canonical_id!=='string' || !/^[a-z0-9][a-z0-9-]{3,120}$/.test(article.canonical_id) || !['zh-CN','en-US'].includes(article.language) || typeof article.text!=='string' || !article.text || !Array.isArray(article.paragraphs) || article.paragraphs.some(p=>typeof p!=='string') || typeof article.title!=='string' || !article.title || !SHA.test(article.article_content_hash)) throw new Error('Invalid narration source');
  if (article.paragraphs.join('\n\n') !== article.text || sha256(article.text) !== article.article_content_hash) throw new Error('Narration source integrity mismatch');
  return Object.freeze({canonical_id:article.canonical_id,locale:article.language,title:article.title,text:article.text,paragraphs:Object.freeze([...article.paragraphs]),source_sha256:sha256(article.text)});
}

function validateSnapshot(snapshot) {
  if(!snapshot || typeof snapshot.canonical_id!=='string' || !/^[a-z0-9][a-z0-9-]{3,120}$/.test(snapshot.canonical_id) || !['zh-CN','en-US'].includes(snapshot.locale) || typeof snapshot.title!=='string' || !snapshot.title || !Array.isArray(snapshot.paragraphs) || snapshot.paragraphs.some(p=>typeof p!=='string') || typeof snapshot.text!=='string' || snapshot.paragraphs.join('\n\n')!==snapshot.text || !SHA.test(snapshot.source_sha256) || sha256(snapshot.text)!==snapshot.source_sha256) throw new Error('Invalid or tampered narration snapshot');
  return snapshot;
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
  validateSnapshot(snapshot);
  if (snapshot.locale !== config.language) throw new Error('Narration locale mismatch');
  return cacheKey({canonical_id:snapshot.canonical_id,language:snapshot.locale,article_content_hash:snapshot.source_sha256},config);
}

export function validateNarrationManifest(m) {
  if (!m || typeof m!=='object' || Array.isArray(m)) throw new Error('Invalid narration manifest');
  for(const f of ['schema_version','canonical_id','locale','source_sha256','voice_config_sha256','provider','model','voice','audio_sha256','audio_format','duration','generation_timestamp','review_status','reviewer_identity','approval_timestamp','publication_status','asset_id','version','history','authorization_trust']) if (!Object.hasOwn(m,f)) throw new Error('Missing narration manifest field: '+f);
  if(m.schema_version!==1 || typeof m.canonical_id!=='string' || !/^[a-z0-9][a-z0-9-]{3,120}$/.test(m.canonical_id) || !['zh-CN','en-US'].includes(m.locale)) throw new Error('Invalid narration identity');
  if(!SHA.test(m.source_sha256) || !SHA.test(m.voice_config_sha256) || !SHA.test(m.audio_sha256) || !SHA.test(m.asset_id)) throw new Error('Invalid narration SHA-256');
  if(m.provider!=='mock' || m.model!=='offline-test-tone-v1' || m.voice!=='synthetic-test-tone' || m.audio_format!=='wav') throw new Error('Production narration not authorized');
  if(!Number.isFinite(m.duration) || m.duration<=0 || !Number.isSafeInteger(m.version) || m.version<1 || !Number.isFinite(Date.parse(m.generation_timestamp))) throw new Error('Invalid narration duration/version/time');
  if(!NARRATION_STATES.includes(m.review_status) || !['NOT_PUBLISHED','PUBLISHED'].includes(m.publication_status) || !Array.isArray(m.history)) throw new Error('Invalid narration status');
  if(m.review_status==='PUBLISHED' || m.publication_status==='PUBLISHED') throw new Error('Mock media cannot be published');
  if(m.authorization_trust!==LOCAL_TRUST) throw new Error('Verified production authorization unavailable');
  if(m.review_status==='APPROVED' && (!m.reviewer_identity || !m.approval_timestamp || !SHA.test(m.approval_asset_sha256||'') || m.approval_asset_sha256!==m.audio_sha256 || m.approval_source_sha256!==m.source_sha256)) throw new Error('Invalid immutable approval reference');
  if(m.review_status!=='APPROVED' && m.review_status!=='STALE' && (m.approval_timestamp || m.reviewer_identity)) throw new Error('Unexpected approval metadata');
  if(m.history.length===0 || m.history.length>10000) throw new Error('Invalid narration audit history');
  let previous='DRAFT',previousTime=-Infinity,approvalEvent=null;
  for(const [index,event] of m.history.entries()) {
    if(!event || typeof event!=='object' || Array.isArray(event) || !['from','to','at','actor','source_sha256','audio_sha256'].every(k=>Object.hasOwn(event,k)) || typeof event.actor!=='string' || !event.actor || !SHA.test(event.source_sha256) || !SHA.test(event.audio_sha256)) throw new Error('Invalid narration audit event');
    if(event.source_sha256!==m.source_sha256 || event.audio_sha256!==m.audio_sha256) throw new Error('Narration audit hash mismatch');
    if(event.from!==previous || !transitions[previous]?.includes(event.to) || event.to==='PUBLISHED') throw new Error('Illegal or missing narration audit transition');
    if(index===0 && (event.from!=='DRAFT' || event.to!=='GENERATED' || event.actor!=='trusted-local-operator')) throw new Error('Invalid narration generation event');
    const time=Date.parse(event.at);
    if(typeof event.at!=='string' || !Number.isFinite(time) || time<previousTime) throw new Error('Out-of-order narration audit timestamp');
    if(index===0 && time!==Date.parse(m.generation_timestamp)) throw new Error('Narration generation timestamp mismatch');
    if(event.to==='APPROVED') {
      if(approvalEvent || event.actor!==m.reviewer_identity || m.approval_timestamp!==event.at) throw new Error('Invalid narration approval event');
      approvalEvent=event;
    } else if(event.actor!=='trusted-local-operator') throw new Error('Invalid local narration audit actor');
    previous=event.to;previousTime=time;
  }
  if(previous!==m.review_status) throw new Error('Invalid narration final audit state');
  if(m.review_status==='APPROVED' && !approvalEvent) throw new Error('Missing simulated approval event');
  if(m.review_status==='STALE' && (m.reviewer_identity || m.approval_timestamp || m.approval_source_sha256 || m.approval_asset_sha256) && !approvalEvent) throw new Error('Invalid stale approval history');
  if(approvalEvent && (typeof m.reviewer_identity!=='string' || !m.reviewer_identity || m.approval_source_sha256!==m.source_sha256 || m.approval_asset_sha256!==m.audio_sha256)) throw new Error('Invalid simulated approval binding');
  return m;
}

export function assertVerifiedNarrationApproval(manifest) {
  validateNarrationManifest(manifest);
  throw new Error('Verified production authorization unavailable: local review is SIMULATED_UNVERIFIED');
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
  if(Date.parse(at)<Date.parse(manifest.history.at(-1).at)) throw new Error('Out-of-order narration audit timestamp');
  const next={...manifest,review_status:to,history:[...manifest.history,{from:manifest.review_status,to,at,actor:to==='APPROVED'?reviewer:'trusted-local-operator',source_sha256:manifest.source_sha256,audio_sha256:manifest.audio_sha256}]};
  if(to==='APPROVED') Object.assign(next,{reviewer_identity:reviewer,approval_timestamp:at,approval_asset_sha256:manifest.audio_sha256,approval_source_sha256:manifest.source_sha256});
  return freezeRecord(validateNarrationManifest(next));
}

export function detectStale(manifest,snapshot) {
  validateNarrationManifest(manifest);
  validateSnapshot(snapshot);
  return manifest.canonical_id!==snapshot.canonical_id || manifest.locale!==snapshot.locale || manifest.source_sha256!==snapshot.source_sha256;
}

/** The only available generator emits a test tone. Caller-owned private temp directory. */
export async function generateOfflineMock({snapshot,config,policy=DEFAULT_COST_POLICY,provider,version=1,trustedLocalTestProvider=false}) {
  assertNoPaidGeneration(policy);
  validateSnapshot(snapshot);
  if(provider!==undefined && trustedLocalTestProvider!==true) throw new Error('Injected provider requires explicit trusted-local test contract');
  if(provider===undefined) provider=new MockToneProvider();
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
    const generatedAt=new Date().toISOString();
    const manifest=freezeRecord(validateNarrationManifest({schema_version:1,canonical_id:snapshot.canonical_id,locale:snapshot.locale,source_sha256:snapshot.source_sha256,voice_config_sha256:voiceConfigHash(config),provider:'mock',model:config.model,voice:config.voice,audio_sha256:audioSha,audio_format:'wav',duration:0.25,generation_timestamp:generatedAt,review_status:'GENERATED',reviewer_identity:null,approval_timestamp:null,publication_status:'NOT_PUBLISHED',authorization_trust:LOCAL_TRUST,asset_id:assetId,version,history:[{from:'DRAFT',to:'GENERATED',at:generatedAt,actor:'trusted-local-operator',source_sha256:snapshot.source_sha256,audio_sha256:audioSha}]}));
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
