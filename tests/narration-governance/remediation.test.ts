import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {AdminBoundary} from '../../src/lib/narration-governance/admin';
import {LocalPrivateObjects} from '../../src/lib/narration-governance/adapters';
import {canonical,digest,type Role,type SourceRef,type VoiceConfig} from '../../src/lib/narration-governance/contracts';
import {IdentityVerifier,VerifiedIdentity} from '../../src/lib/narration-governance/identity';
import {NarrationGovernance,reserve} from '../../src/lib/narration-governance/service';
import {SqliteGovernanceStore} from '../../src/lib/narration-governance/store';

const keys=generateKeyPairSync('rsa',{modulusLength:2048});
const publicPem=keys.publicKey.export({type:'spki',format:'pem'}).toString();
function token(subject:string) {
  const h=Buffer.from(JSON.stringify({alg:'RS256',typ:'JWT',kid:'key1'})).toString('base64url');
  const p=Buffer.from(JSON.stringify({iss:'test-issuer',aud:'admin',sub:subject,sid:'session',iat:1,exp:999999})).toString('base64url');
  return h+'.'+p+'.'+sign('RSA-SHA256',Buffer.from(h+'.'+p),keys.privateKey).toString('base64url');
}
function fixture() {
  const root=mkdtempSync(join(tmpdir(),'narration-remediation-'));mkdirSync(join(root,'objects'),{mode:0o700});
  let clock=100000;let sequence=0;
  const roles:Record<string,Role[]>={generator:['Generator'],second:['Generator'],reviewer:['Reviewer'],publisher:['Publisher'],outsider:[]};
  const source:SourceRef={canonical_id:'article-remediation',locale:'en-US',commit:'a'.repeat(40),parser_version:'phase6c/v1',source_sha256:digest('published')};
  const voice:VoiceConfig={provider:'mock',model:'tone',voice:'mock',language:'en-US',format:'wav',speed:1,version:1,instructions:''};
  const auth=new IdentityVerifier('test-issuer','admin',new Map([['key1',publicPem]]),{sessionActive:()=>true,roles:subject=>roles[subject]??[]},()=>clock);
  const store=new SqliteGovernanceStore(join(root,'state.sqlite'));
  const service=new NarrationGovernance(store,auth,{current:()=>source},{current:()=>voice},new LocalPrivateObjects(join(root,'objects')),()=>clock);
  return {root,source,voice,roles,auth,store,service,actor:(subject:string)=>auth.authenticate(token(subject)),request:()=> 'remediation-'+(++sequence),now:()=>clock,advance:()=>{clock+=31000;},close:()=>{store.close();rmSync(root,{recursive:true,force:true});}};
}

test('F-01: created and deduplicated submissions audit the durable job and exact source',()=>{
  const f=fixture();try {
    const j=f.service.submit(f.actor('generator'),f.request(),f.source);
    const first=f.store.snapshot().events.at(-1)!;
    assert.equal(first.job_id,j.id);assert.deepEqual(first.source,j.source);
    assert.equal(first.binding,digest(canonical({source:j.source,voice:j.voice,asset:null})));
    assert.equal(first.actor,'generator');assert.equal(first.from,null);assert.equal(first.to,'DRAFT');
    const duplicate=f.service.submit(f.actor('second'),f.request(),f.source);
    const second=f.store.snapshot().events.at(-1)!;
    assert.equal(duplicate.id,j.id);assert.equal(Object.keys(f.store.snapshot().jobs).length,1);
    assert.equal(second.job_id,j.id);assert.deepEqual(second.source,j.source);assert.equal(second.binding,first.binding);
    assert.equal(second.actor,'second');assert.equal(second.from,'DRAFT');assert.equal(second.to,'DRAFT');
    assert.equal(j.creator,'generator');
  } finally {f.close();}
});

test('F-02: authenticated authorization denials keep the verified subject and safe reason',()=>{
  const f=fixture();try {
    const j=f.service.submit(f.actor('generator'),f.request(),f.source);
    assert.throws(()=>f.service.claim(f.actor('outsider'),f.request(),j.id),/DENIED/);
    let event=f.store.snapshot().events.at(-1)!;
    assert.equal(event.actor,'outsider');assert.equal(event.outcome,'denied');assert.equal(event.denial_reason,'AUTHORIZATION_DENIED');
    const actor=f.actor('generator');f.roles.generator=[];
    assert.throws(()=>f.service.claim(actor,f.request(),j.id),/DENIED/);
    event=f.store.snapshot().events.at(-1)!;assert.equal(event.actor,'generator');assert.equal(event.denial_reason,'AUTHORIZATION_DENIED');
    assert(!f.store.exportAudit().includes(token('generator')));
    assert.equal(f.store.snapshot().jobs[j.id].attempt,0);
  } finally {f.close();}
});

test('F-02: forged contexts stay unverified; authenticated business failures keep attribution',()=>{
  const f=fixture();try {
    const a=f.actor('generator');const j=f.service.submit(a,f.request(),f.source);
    assert.throws(()=>f.service.claim(VerifiedIdentity.issue('reviewer','session',999999999),f.request(),j.id),/DENIED/);
    let event=f.store.snapshot().events.at(-1)!;
    assert.equal(event.actor,'unverified');assert.equal(event.denial_reason,'AUTHENTICATION_DENIED');
    f.service.claim(a,f.request(),j.id);assert.throws(()=>f.service.claim(a,f.request(),j.id),/LEASE/);
    event=f.store.snapshot().events.at(-1)!;assert.equal(event.actor,'generator');assert.equal(event.denial_reason,'LEASE');
  } finally {f.close();}
});

test('F-03: expired retry releases its reservation and fences the previous worker',()=>{
  const f=fixture();try {
    const a=f.actor('generator');const j=f.service.submit(a,f.request(),f.source);const c=f.service.claim(a,f.request(),j.id);
    // Isolated accounting fixture: no provider invocation, actual usage or production spend.
    f.store.transaction(l=>{l.cap=20;reserve(l,l.jobs[j.id],10);});
    f.advance();const reconciled=f.service.reconcile(a,f.request(),j.id);
    assert.equal(reconciled.state,'DRAFT');assert.equal(reconciled.attempt,1);assert.equal(reconciled.lease,null);
    assert.equal(reconciled.fence,c.fence+1);assert.equal(reconciled.reservation,0);assert.equal(f.store.snapshot().reserved,0);assert.equal(f.store.snapshot().spent,0);
    assert.throws(()=>f.service.complete(a,f.request(),j.id,c.fence,Buffer.from('old')),/LEASE/);
    const next=f.service.claim(a,f.request(),j.id);assert.equal(next.attempt,2);assert(next.fence>reconciled.fence);
    assert.throws(()=>f.service.complete(a,f.request(),j.id,c.fence,Buffer.from('old')),/LEASE/);
    f.service.complete(a,f.request(),j.id,next.fence,Buffer.from('mock'));
    assert.equal(f.store.snapshot().jobs[j.id].state,'PENDING_REVIEW');
  } finally {f.close();}
});

test('F-03: reconciliation requires authorization and refuses an active lease',()=>{
  const f=fixture();try {
    const a=f.actor('generator');const j=f.service.submit(a,f.request(),f.source);f.service.claim(a,f.request(),j.id);
    const before=f.store.snapshot().jobs[j.id];
    assert.throws(()=>f.service.reconcile(f.actor('outsider'),f.request(),j.id),/DENIED/);
    assert.throws(()=>f.service.reconcile(a,f.request(),j.id),/LEASE/);
    assert.deepEqual(f.store.snapshot().jobs[j.id],before);
  } finally {f.close();}
});

test('F-03: a killed final worker can be reconciled through the protected admin boundary',async(t)=>{
  const f=fixture();try {
    const a=f.actor('generator');const j=f.service.submit(a,f.request(),f.source);
    for(let i=0;i<2;i++){f.service.claim(a,f.request(),j.id);f.advance();}
    const child=spawn(process.execPath,['--import','tsx','tests/narration-governance/claim-worker.ts',f.root,j.id,publicPem,token('generator'),f.request(),'claim-and-wait',String(f.now())],{stdio:['ignore','pipe','ignore']});
    t.after(()=>{if(child.exitCode===null && child.signalCode===null) child.kill('SIGKILL');});
    const exit=new Promise<string|null>((resolve,reject)=>{child.once('error',reject);child.once('exit',(_code,signal)=>resolve(signal));});
    await new Promise<void>((resolve,reject)=>{child.stdout.once('data',()=>resolve());child.once('error',reject);child.once('exit',()=>reject(Error('worker exited before claim')));});
    const claimed=f.store.snapshot().jobs[j.id];assert.equal(claimed.attempt,3);
    child.kill('SIGKILL');assert.equal(await exit,'SIGKILL');f.advance();
    const boundary=new AdminBoundary(f.auth,f.service);const req=f.request();
    boundary.execute('Bearer '+token('generator'),{action:'reconcile',request:req,job:j.id});
    const failed=f.store.snapshot().jobs[j.id];assert.equal(failed.state,'FAILED');assert.equal(failed.lease,null);assert.equal(failed.fence,claimed.fence+1);
    assert.throws(()=>f.service.complete(a,f.request(),j.id,claimed.fence,Buffer.from('late')),/LEASE/);
    assert.throws(()=>f.service.publish(f.actor('publisher'),f.request(),j.id),/DENIED/);
    assert.throws(()=>f.service.recover(a,f.request(),j.id),/STATE/);
    assert.throws(()=>boundary.execute('Bearer '+token('generator'),{action:'reconcile',request:req,job:j.id}),/REPLAY/);
    const again=f.service.reconcile(a,f.request(),j.id);assert.equal(again.fence,failed.fence);assert.equal(again.state,'FAILED');
    assert.equal(f.service.submit(a,f.request(),f.source).id,j.id);
    const event=f.store.snapshot().events.find(e=>e.action==='reconcile' && e.from==='DRAFT')!;
    assert.equal(event.actor,'generator');assert.equal(event.to,'FAILED');assert.equal(event.job_id,j.id);assert.deepEqual(event.source,j.source);
    const reopened=new SqliteGovernanceStore(join(f.root,'state.sqlite'));assert.equal(reopened.snapshot().jobs[j.id].state,'FAILED');reopened.close();
  } finally {f.close();}
});

test('F-03: independent reconcilers release and fence an exhausted lease exactly once',async()=>{
  const f=fixture();try {
    const a=f.actor('generator');const j=f.service.submit(a,f.request(),f.source);let oldFence=0;
    for(let i=0;i<3;i++){oldFence=f.service.claim(a,f.request(),j.id).fence;f.advance();}
    f.store.transaction(l=>{l.cap=20;reserve(l,l.jobs[j.id],10);});
    const run=()=>new Promise<number|null>((resolve,reject)=>{const p=spawn(process.execPath,['--import','tsx','tests/narration-governance/claim-worker.ts',f.root,j.id,publicPem,token('generator'),f.request(),'reconcile',String(f.now())],{stdio:'ignore'});p.once('error',reject);p.once('exit',resolve);});
    assert.deepEqual(await Promise.all([run(),run()]),[0,0]);
    const l=f.store.snapshot();assert.equal(l.jobs[j.id].state,'FAILED');assert.equal(l.jobs[j.id].fence,oldFence+1);assert.equal(l.jobs[j.id].reservation,0);assert.equal(l.reserved,0);assert.equal(l.spent,0);
    assert.equal(l.events.filter(e=>e.action==='reconcile' && e.from==='DRAFT' && e.to==='FAILED').length,1);
    assert.throws(()=>f.service.complete(a,f.request(),j.id,oldFence,Buffer.from('late')),/LEASE/);
  } finally {f.close();}
});

test('audit schema upgrade preserves existing append-only event hashes',()=>{
  const f=fixture();try {
    const body={sequence:1,actor:'generator',action:'legacy',request_id:f.request(),job_id:null,at:f.now(),from:null,to:null,outcome:'allowed' as const,policy_version:'ADR-0032/v1',binding:null,previous:digest('ADR-0032/audit/v1')};
    const legacy={...body,hash:digest(canonical(body))};f.store.transaction(l=>{l.events.push(legacy);});
    const job=f.service.submit(f.actor('generator'),f.request(),f.source);
    const events=f.store.snapshot().events;assert.deepEqual(events[0],legacy);assert.deepEqual(events[1].source,job.source);
    const reopened=new SqliteGovernanceStore(join(f.root,'state.sqlite'));assert.deepEqual(reopened.snapshot().events[0],legacy);reopened.close();
  } finally {f.close();}
});

test('F-03: snapshots stay consistent while another process appends reconciliation audits',{timeout:10000},async(t)=>{
  const f=fixture();try {
    const j=f.service.submit(f.actor('generator'),f.request(),f.source);
    const child=spawn(process.execPath,['--import','tsx','tests/narration-governance/claim-worker.ts',f.root,j.id,publicPem,token('generator'),f.request(),'audit-traffic',String(f.now())],{stdio:['ignore','pipe','ignore']});
    t.after(()=>{if(child.exitCode===null && child.signalCode===null) child.kill('SIGKILL');});
    let finished=false;
    const exit=new Promise<number|null>((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>{finished=true;resolve(code);});});
    await new Promise<void>((resolve,reject)=>{child.stdout.once('data',()=>resolve());child.once('error',reject);child.once('exit',()=>reject(Error('worker exited before audit traffic')));});
    let observed=0;
    while(!finished) {f.store.snapshot();observed++;await new Promise(resolve=>setImmediate(resolve));}
    assert.equal(await exit,0);assert(observed>0);
    assert.equal(f.store.snapshot().events.filter(e=>e.action==='reconcile').length,30);
  } finally {f.close();}
});
