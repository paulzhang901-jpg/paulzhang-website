import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {mkdtempSync,mkdirSync,rmSync,writeFileSync,chmodSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
import {AdminBoundary} from '../../src/lib/narration-governance/admin';
import {LocalPrivateObjects} from '../../src/lib/narration-governance/adapters';
import {canonical,digest,SAFETY,type Role,type SourceRef,type VoiceConfig} from '../../src/lib/narration-governance/contracts';
import {IdentityVerifier,VerifiedIdentity} from '../../src/lib/narration-governance/identity';
import {NarrationGovernance,reserve,settle} from '../../src/lib/narration-governance/service';
import {SqliteGovernanceStore} from '../../src/lib/narration-governance/store';

const keys=generateKeyPairSync('rsa',{modulusLength:2048});
const publicPem=keys.publicKey.export({type:'spki',format:'pem'}).toString();
const token=(sub:string,overrides={})=>{
  const header=Buffer.from(JSON.stringify({alg:'RS256',typ:'JWT',kid:'key1'})).toString('base64url');
  const body=Buffer.from(JSON.stringify({iss:'test-issuer',aud:'admin',sub,sid:'session',iat:1,exp:999999,...overrides})).toString('base64url');
  return header+'.'+body+'.'+sign('RSA-SHA256',Buffer.from(header+'.'+body),keys.privateKey).toString('base64url');
};
function fixture() {
  const root=mkdtempSync(join(tmpdir(),'governance-'));mkdirSync(join(root,'objects'),{mode:0o700});
  let clock=100000;let active=true;
  let source:SourceRef={canonical_id:'article-test',locale:'zh-CN',commit:'a'.repeat(40),parser_version:'phase6c/v1',source_sha256:digest('published')};
  let voice:VoiceConfig={provider:'mock',model:'tone',voice:'test',language:'zh-CN',format:'wav',speed:1,version:1,instructions:''};
  const roles:Record<string,Role[]>={generator:['Generator'],reviewer:['Reviewer'],publisher:['Publisher'],all:['Generator','Reviewer','Publisher'],outsider:[]};
  const verifier=new IdentityVerifier('test-issuer','admin',new Map([['key1',publicPem]]),{sessionActive:()=>active,roles:s=>roles[s]??[]},()=>clock);
  const store=new SqliteGovernanceStore(join(root,'state.sqlite'));
  const objects=new LocalPrivateObjects(join(root,'objects'));
  const service=new NarrationGovernance(store,verifier,{current:()=>source},{current:()=>voice},objects,()=>clock);
  let req=0;const request=()=> 'request-'+(++req);
  const actor=(s:string)=>verifier.authenticate(token(s));
  const generated=()=>{
    const g=actor('generator');const j=service.submit(g,request(),source);const claimed=service.claim(g,request(),j.id);
    return service.complete(g,request(),j.id,claimed.fence,Buffer.from('isolated mock bytes'));
  };
  return {root,verifier,store,objects,service,request,actor,generated,source:()=>source,changeSource:()=>{source={...source,source_sha256:digest('changed')};},changeVoice:()=>{voice={...voice,version:2};},advance:()=>{clock+=31000;},revokeSession:()=>{active=false;},close:()=>{store.close();rmSync(root,{recursive:true,force:true});}};
}
test('authenticated end-to-end mock workflow, bound listening approval, disabled publication and revocation',()=>{
 const f=fixture();try {
  const j=f.generated();f.service.review(f.actor('reviewer'),f.request(),j.id,'approve',true);
  const approved=f.store.snapshot().jobs[j.id];assert.equal(approved.approval?.asset.audio_sha256,j.asset?.audio_sha256);
  assert.deepEqual(f.service.readAsset(f.actor('reviewer'),j.id),Buffer.from('isolated mock bytes'));
  assert.throws(()=>f.service.publish(f.actor('publisher'),f.request(),j.id),/DISABLED/);
  assert.throws(()=>f.service.publish(f.actor('outsider'),f.request(),j.id),/DENIED/);
  f.service.revoke(f.actor('reviewer'),f.request(),j.id);assert.equal(f.store.snapshot().jobs[j.id].state,'REJECTED');
  assert.throws(()=>f.service.readAsset(f.actor('reviewer'),j.id),/DENIED/);
  assert.deepEqual(SAFETY,{productionTtsEnabled:false,costAuthorized:false,maxSpendUsd:0});
 } finally {f.close();}
});
test('forged identity, JWT signature/issuer/audience/expiry, revoked sessions and caller review metadata denied',()=>{
 const f=fixture();try {
  for(const claims of [{iss:'forged'},{aud:'wrong'},{exp:1},{iat:1000},{nbf:1000}]) assert.throws(()=>f.verifier.authenticate(token('reviewer',claims)),/DENIED/);
  assert.throws(()=>f.verifier.authenticate(token('reviewer').replace(/.$/,'!')),/DENIED/);
  assert.throws(()=>f.verifier.authorize(VerifiedIdentity.issue('reviewer','session',999999999),'Reviewer'),/DENIED/);
  const j=f.generated();assert.throws(()=>f.service.review(f.actor('outsider'),f.request(),j.id,'approve',true),/DENIED/);
  assert.throws(()=>f.service.review(f.actor('reviewer'),f.request(),j.id,'approve',false),/DENIED/);
  const admin=new AdminBoundary(f.verifier,f.service);
  assert.throws(()=>admin.execute('Bearer '+token('reviewer'),{action:'review',request:f.request(),job:j.id,decision:'approve',human_listening:true,reviewer:'forged'}));
  assert.throws(()=>f.service.readAsset(f.actor('outsider'),j.id),/DENIED/);
  const identity=f.actor('reviewer');f.revokeSession();assert.throws(()=>f.verifier.authorize(identity,'Reviewer'),/DENIED/);
 } finally {f.close();}
});
test('creator cannot approve even with reviewer role; distinct listening required per locale',()=>{
 const f=fixture();try {
  const a=f.actor('all');const j=f.service.submit(a,f.request(),f.source());const c=f.service.claim(a,f.request(),j.id);
  f.service.complete(a,f.request(),j.id,c.fence,Buffer.from('mock'));
  assert.throws(()=>f.service.review(a,f.request(),j.id,'approve',true),/DENIED/);
 } finally {f.close();}
});
test('duplicate submissions, request replay, concurrent claims and expired fencing',()=>{
 const f=fixture();try {
  const a=f.actor('generator');const request=f.request();const j=f.service.submit(a,request,f.source());
  assert.throws(()=>f.service.submit(a,request,f.source()),/REPLAY/);
  assert.equal(f.service.submit(a,f.request(),f.source()).id,j.id);
  const first=f.service.claim(a,f.request(),j.id);assert.throws(()=>f.service.claim(a,f.request(),j.id),/LEASE/);
  f.advance();const second=f.service.claim(a,f.request(),j.id);
  assert.throws(()=>f.service.complete(a,f.request(),j.id,first.fence,Buffer.from('mock')),/LEASE/);
  f.service.complete(a,f.request(),j.id,second.fence,Buffer.from('mock'));
  assert.throws(()=>f.service.complete(a,f.request(),j.id,second.fence,Buffer.from('mock')),/LEASE/);
 } finally {f.close();}
});
test('failure recovery, transaction rollback, spending limits and finite retries',()=>{
 const f=fixture();try {
  const a=f.actor('generator');const j=f.service.submit(a,f.request(),f.source());
  for(let attempt=0;attempt<3;attempt++) {
   const c=f.service.claim(a,f.request(),j.id);f.service.fail(a,f.request(),j.id,c.fence);
   if(attempt<2) f.service.recover(a,f.request(),j.id);
  }
  assert.throws(()=>f.service.recover(a,f.request(),j.id),/STATE/);
  assert.equal(f.store.snapshot().reserved,0);
  assert.throws(()=>f.store.transaction(l=>{reserve(l,l.jobs[j.id],1);}),/BUDGET/);
  assert.throws(()=>f.store.transaction(l=>{l.cap=100;reserve(l,l.jobs[j.id],10);throw Error('interrupted');}),/interrupted/);
  assert.equal(f.store.snapshot().cap,0);
  f.store.transaction(l=>{l.cap=20;reserve(l,l.jobs[j.id],10);assert.throws(()=>settle(l,l.jobs[j.id],11),/BUDGET/);settle(l,l.jobs[j.id],7);});
  assert.equal(f.store.snapshot().spent,7);assert.equal(f.store.snapshot().reserved,0);
 } finally {f.close();}
});
test('source and voice changes invalidate approval; asset tampering and audit tampering fail closed',()=>{
 for(const change of ['source','voice']) {
  const f=fixture();try {
   const j=f.generated();f.service.review(f.actor('reviewer'),f.request(),j.id,'approve',true);
   if(change==='source') f.changeSource();else f.changeVoice();
   assert.throws(()=>f.service.publish(f.actor('publisher'),f.request(),j.id),/STALE/);
   assert.equal(f.store.snapshot().jobs[j.id].state,'STALE');assert.equal(f.store.snapshot().jobs[j.id].approval,undefined);
  } finally {f.close();}
 }
 const f=fixture();try {
  const j=f.generated();writeFileSync(join(f.root,'objects',j.asset!.object_key),'tampered');
  assert.throws(()=>f.service.review(f.actor('reviewer'),f.request(),j.id,'approve',true),/INTEGRITY/);
  const ledger=f.store.snapshot();assert(ledger.events.some(e=>e.outcome==='denied'));assert(!f.store.exportAudit().includes('isolated mock bytes'));
  const db=new DatabaseSync(join(f.root,'state.sqlite'));ledger.events[0].actor='tampered';db.prepare('UPDATE governance SET body=?').run(canonical(ledger));db.close();
  assert.throws(()=>f.store.snapshot(),/INTEGRITY/);
 } finally {f.close();}
});
test('durable store survives restart and independent processes serialize claims',async()=>{
 const f=fixture();try {
  const j=f.service.submit(f.actor('generator'),f.request(),f.source());
  const second=new SqliteGovernanceStore(join(f.root,'state.sqlite'));assert.equal(second.snapshot().jobs[j.id].id,j.id);second.close();
  // Independent authenticated service processes contend on the same durable store.
  const run=()=>new Promise<number|null>((resolve,reject)=>{const p=spawn(process.execPath,['--import','tsx','tests/narration-governance/claim-worker.ts',f.root,j.id,publicPem,token('generator'),f.request()],{stdio:'ignore'});p.on('error',reject);p.on('exit',resolve);});
  const exits=await Promise.all([run(),run()]);assert.deepEqual(exits.sort(),[0,2]);assert.equal(f.store.snapshot().jobs[j.id].fence,1);
 } finally {f.close();}
});
test('deterministic serialization rejects unsupported values',()=>{
 assert.equal(canonical({b:2,a:1}),canonical({a:1,b:2}));assert.throws(()=>canonical({a:undefined}),/INVALID/);assert.throws(()=>canonical(NaN),/INVALID/);
});

test('audit append-only enforcement and truncation detection',()=>{
 const f=fixture();try {
  f.generated();const db=new DatabaseSync(join(f.root,'state.sqlite'));
  assert.throws(()=>db.exec('DELETE FROM audit'),/append-only/);
  assert.throws(()=>db.exec("UPDATE audit SET body='{}'"),/append-only/);
  const ledger=f.store.snapshot();ledger.events.pop();db.prepare('UPDATE governance SET body=?').run(canonical(ledger));db.close();
  assert.throws(()=>f.store.snapshot(),/INTEGRITY/);
 } finally {f.close();}
});
test('private storage refuses public permissions, path traversal, mismatched objects, and overwrite',()=>{
 const root=mkdtempSync(join(tmpdir(),'private-'));try {
  mkdirSync(join(root,'public'),{mode:0o755});chmodSync(join(root,'public'),0o755);assert.throws(()=>new LocalPrivateObjects(join(root,'public')),/DENIED/);
  mkdirSync(join(root,'private'),{mode:0o700});const objects=new LocalPrivateObjects(join(root,'private'));
  assert.throws(()=>objects.read('../escape'),/INVALID/);
  assert.throws(()=>objects.putExclusive(digest('one'),Buffer.from('two')),/INTEGRITY/);
  objects.putExclusive(digest('one'),Buffer.from('one'));objects.putExclusive(digest('one'),Buffer.from('one'));
  assert.equal(objects.read(digest('one')).toString(),'one');
 } finally {rmSync(root,{recursive:true,force:true});}
});
