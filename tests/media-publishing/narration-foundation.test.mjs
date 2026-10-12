import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,mkdir,symlink,rm,stat} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {sha256} from '../../src/lib/media-publishing/core.mjs';
import {DEFAULT_COST_POLICY,DisabledNarrationStorage,assertNoPaidGeneration,createNarrationSnapshot,readPilotSnapshot,narrationCacheKey,generateOfflineMock,transitionNarration,detectStale,validateNarrationManifest,assertVerifiedNarrationApproval,productionProvider} from '../../src/lib/media-publishing/narration-foundation.mjs';

const config=Object.freeze({provider:'mock',model:'offline-test-tone-v1',voice:'synthetic-test-tone',format:'wav',language:'zh-CN'});
const root=process.cwd();

test('real bilingual published article snapshots preserve identity, paragraphs and distinct hashes',async()=>{
  const zh=await readPilotSnapshot(root,'zh-CN');
  const en=await readPilotSnapshot(root,'en-US');
  assert.equal(zh.canonical_id,en.canonical_id);
  assert.equal(zh.canonical_id,'article-true-freedom-2026-10-02');
  assert.notEqual(zh.source_sha256,en.source_sha256);
  assert.equal(zh.source_sha256,sha256(zh.paragraphs.join('\n\n')));
  assert.equal(en.source_sha256,sha256(en.text));
  assert.equal(zh.title,'真正的自由');
  assert.equal(en.title,'True Freedom');
  assert.notEqual(narrationCacheKey(zh,config),narrationCacheKey(en,{...config,language:'en-US'}));
  assert.throws(()=>createNarrationSnapshot({canonical_id:zh.canonical_id,language:zh.locale,title:zh.title,paragraphs:zh.paragraphs,text:'tampered',article_content_hash:zh.source_sha256}),/integrity/);
  assert.throws(()=>narrationCacheKey(en,config),/locale/);
  assert.equal(Object.isFrozen(zh),true);
});

test('pilot source paths cannot traverse or follow symlinks',async()=>{
  await assert.rejects(()=>readPilotSnapshot(root,'../../etc/passwd'),/locale/);
  const dir=await mkdtemp(path.join(os.tmpdir(),'paul-narration-source-test-'));
  try {
    const parent=path.join(dir,'content/zh-CN/library');await mkdir(parent,{recursive:true});
    await symlink(path.join(root,'content/zh-CN/library/true-freedom.mdx'),path.join(parent,'true-freedom.mdx'));
    await assert.rejects(()=>readPilotSnapshot(dir,'zh-CN'),/Unsafe pilot source/);
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('deny all paid cost authorizations and production provider/storage access',async()=>{
  assert.doesNotThrow(()=>assertNoPaidGeneration(DEFAULT_COST_POLICY));
  for(const change of [{productionTtsEnabled:true},{costAuthorized:true},{maxSpendUsd:1},{maxSpendUsd:-1},{}]) {
    if(Object.keys(change).length) assert.throws(()=>assertNoPaidGeneration({...DEFAULT_COST_POLICY,...change}),/DISABLED/);
  }
  assert.throws(()=>productionProvider(),/disabled/);
  const storage=new DisabledNarrationStorage();
  await assert.rejects(()=>storage.put(),/disabled/);
  await assert.rejects(()=>storage.publish(),/disabled/);
});

test('mock generation is private, verified, immutable metadata, never published',async()=>{
  const snapshot=await readPilotSnapshot(root,'zh-CN');
  const result=await generateOfflineMock({snapshot,config});
  try {
    assert.equal((await stat(result.directory)).mode&0o777,0o700);
    assert.equal((await stat(result.audioPath)).mode&0o777,0o600);
    const bytes=await readFile(result.audioPath);
    assert.equal(sha256(bytes),result.manifest.audio_sha256);
    assert.equal(result.manifest.publication_status,'NOT_PUBLISHED');
    assert.equal(result.manifest.review_status,'GENERATED');
    assert.equal(result.manifest.source_sha256,snapshot.source_sha256);
    assert.equal(result.manifest.voice_config_sha256.length,64);
    const cached=await generateOfflineMock({snapshot,config});
    assert.equal(cached.cacheHit,true);
    assert.equal(cached.audioPath,result.audioPath);
    assert.equal(Object.isFrozen(result.manifest.history),true);
    assert.throws(()=>validateNarrationManifest({...result.manifest,audio_sha256:'0'.repeat(20)}),/SHA-256/);
    assert.throws(()=>validateNarrationManifest({...result.manifest,provider:'openai'}),/not authorized/);
    assert.throws(()=>validateNarrationManifest({...result.manifest,publication_status:'PUBLISHED'}),/cannot be published/);
    assert.throws(()=>validateNarrationManifest({...result.manifest,history:[]}),/history/);
    assert.equal(detectStale(result.manifest,snapshot),false);
    const changedText=snapshot.text+'\n\nUpdated';
    assert.equal(detectStale(result.manifest,{...snapshot,text:changedText,paragraphs:[...snapshot.paragraphs,'Updated'],source_sha256:sha256(changedText)}),true);
    const regenerated=await generateOfflineMock({snapshot,config,version:2});
    try {assert.notEqual(regenerated.manifest.asset_id,result.manifest.asset_id);} finally {await regenerated.cleanup();}
  } finally {await result.cleanup();}
});

test('review transitions require trusted reviewer, matching immutable hashes, no publication',async()=>{
  const snapshot=await readPilotSnapshot(root,'zh-CN');
  const result=await generateOfflineMock({snapshot,config});
  try {
    const pending=transitionNarration(result.manifest,'PENDING_REVIEW');
    const assetBytes=await readFile(result.audioPath);
    assert.throws(()=>transitionNarration(pending,'APPROVED',{reviewer:'attacker',authorizedReviewers:['Paul'],sourceSha256:snapshot.source_sha256,assetSha256:pending.audio_sha256}),/Unauthorized/);
    assert.throws(()=>transitionNarration(pending,'APPROVED',{reviewer:'Paul',authorizedReviewers:['Paul'],sourceSha256:snapshot.source_sha256,assetSha256:'0'.repeat(64)}),/mismatch/);
    assert.throws(()=>transitionNarration(pending,'APPROVED',{reviewer:'Paul',authorizedReviewers:['Paul'],sourceSha256:'0'.repeat(64),assetSha256:pending.audio_sha256}),/Stale/);
    assert.throws(()=>transitionNarration(pending,'APPROVED',{reviewer:'Paul',authorizedReviewers:['Paul'],sourceSha256:snapshot.source_sha256,assetSha256:pending.audio_sha256,assetBytes:Buffer.alloc(assetBytes.length)}),/Invalid|Silent/);
    const approved=transitionNarration(pending,'APPROVED',{reviewer:'Paul',authorizedReviewers:['Paul'],sourceSha256:snapshot.source_sha256,assetSha256:pending.audio_sha256,assetBytes});
    assert.equal(approved.reviewer_identity,'Paul');
    assert.equal(approved.approval_asset_sha256,approved.audio_sha256);
    assert.equal(approved.approval_source_sha256,snapshot.source_sha256);
    assert.throws(()=>transitionNarration(approved,'PUBLISHED'),/disabled/);
    assert.throws(()=>transitionNarration(result.manifest,'PUBLISHED'),/Forbidden/);
    const rejected=transitionNarration(pending,'REJECTED');
    assert.throws(()=>transitionNarration(rejected,'PUBLISHED'),/Forbidden/);
    const stale=transitionNarration(approved,'STALE');
    assert.equal(stale.review_status,'STALE');
    assert.throws(()=>transitionNarration(stale,'APPROVED'),/Forbidden/);
    assert.equal(approved.history.length,3);
  } finally {await result.cleanup();}
});

test('duplicate concurrent generation is denied; no paid provider may be substituted',async()=>{
  const snapshot=await readPilotSnapshot(root,'zh-CN');
  let release;
  const gate=new Promise(r=>{release=r;});
  const mock={async generate(){await gate;return (await import('../../src/lib/media-publishing/core.mjs')).MockToneProvider.prototype.generate();}};
  const first=generateOfflineMock({snapshot,config,provider:mock,trustedLocalTestProvider:true});
  try {
    await assert.rejects(()=>generateOfflineMock({snapshot,config}),/Duplicate/);
    await assert.rejects(()=>generateOfflineMock({snapshot,config:{...config,provider:'openai'}}),/Only offline/);
    await assert.rejects(()=>generateOfflineMock({snapshot,config,policy:{...DEFAULT_COST_POLICY,costAuthorized:true}}),/DISABLED/);
  } finally {release();const r=await first;await r.cleanup();}
});

test('forged approval and malformed history never establish verified authorization',async()=>{
  const snapshot=await readPilotSnapshot(root,'zh-CN');
  const result=await generateOfflineMock({snapshot,config});
  try {
    const m=result.manifest;
    assert.equal(m.authorization_trust,'SIMULATED_UNVERIFIED');
    assert.throws(()=>assertVerifiedNarrationApproval(m),/unavailable/);
    const forged={...m,review_status:'APPROVED',reviewer_identity:'forged',approval_timestamp:m.generation_timestamp,approval_asset_sha256:m.audio_sha256,approval_source_sha256:m.source_sha256,history:[...m.history,{from:'GENERATED',to:'APPROVED',at:m.generation_timestamp,actor:'forged',source_sha256:m.source_sha256,audio_sha256:m.audio_sha256}]};
    assert.throws(()=>validateNarrationManifest(forged),/transition/);
    const pending=transitionNarration(m,'PENDING_REVIEW');
    const approved=transitionNarration(pending,'APPROVED',{reviewer:'Paul',authorizedReviewers:['Paul'],sourceSha256:snapshot.source_sha256,assetSha256:m.audio_sha256,assetBytes:await readFile(result.audioPath)});
    assert.throws(()=>assertVerifiedNarrationApproval(approved),/unavailable/);
    assert.throws(()=>validateNarrationManifest({...approved,authorization_trust:'VERIFIED'}),/unavailable/);
    assert.throws(()=>validateNarrationManifest({...approved,history:[{to:'APPROVED',actor:'forged'}]}),/audit/);
    assert.throws(()=>validateNarrationManifest({...approved,history:[m.history[0],approved.history.at(-1)]}),/transition/);
    assert.throws(()=>validateNarrationManifest({...approved,history:approved.history.map((e,i)=>i===1?{...e,at:'2000-01-01T00:00:00.000Z'}:e)}),/timestamp/);
    assert.throws(()=>validateNarrationManifest({...approved,history:approved.history.map((e,i)=>i===1?{...e,to:'REJECTED'}:e)}),/transition/);
    assert.throws(()=>validateNarrationManifest({...approved,history:approved.history.map((e,i)=>i===1?{...e,source_sha256:'0'.repeat(64)}:e)}),/hash/);
    assert.throws(()=>validateNarrationManifest({...approved,history:approved.history.map((e,i)=>i===1?{...e,audio_sha256:'0'.repeat(64)}:e)}),/hash/);
    assert.throws(()=>validateNarrationManifest({...approved,history:[...approved.history,approved.history.at(-1)]}),/transition/);
    assert.throws(()=>validateNarrationManifest({...approved,review_status:'REJECTED'}),/state|metadata/);
  } finally {await result.cleanup();}
});

test('invalid snapshots and unauthorized injected providers are rejected',async()=>{
  const snapshot=await readPilotSnapshot(root,'zh-CN');
  for(const changed of [{...snapshot,text:'changed'},{...snapshot,source_sha256:'0'.repeat(64)},{...snapshot,paragraphs:['changed']},{...snapshot,locale:'en-US',text:'changed'},{...snapshot,canonical_id:'../escape'}]) {
    await assert.rejects(()=>generateOfflineMock({snapshot:changed,config}),/snapshot|locale/);
  }
  await assert.rejects(()=>generateOfflineMock({snapshot,config,provider:{generate(){throw Error('should not execute');}}}),/trusted-local/);
  assert.throws(()=>narrationCacheKey({...snapshot,text:'tampered'},config),/snapshot/);
});
