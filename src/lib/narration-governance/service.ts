import {randomUUID} from 'node:crypto';
import {AssetSchema,SourceSchema,VoiceSchema,canonical,digest,GovernanceError,identifier,POLICY_VERSION,SAFETY,transition,type AuditEvent,type Job,type Ledger,type PrivateObjects,type Role,type SourceAuthority,type VoiceAuthority} from './contracts';
import {IdentityVerifier,type VerifiedIdentity} from './identity';
import {SqliteGovernanceStore} from './store';

export function reserve(ledger:Ledger,job:Job,micros:number) {
  if(!Number.isSafeInteger(micros) || micros<0 || ledger.spent+ledger.reserved+micros>ledger.cap || job.reservation!==0) throw new GovernanceError('BUDGET');
  ledger.reserved+=micros;job.reservation=micros;
}
export function settle(ledger:Ledger,job:Job,actual:number) {
  if(!Number.isSafeInteger(actual) || actual<0 || actual>job.reservation) throw new GovernanceError('BUDGET');
  ledger.reserved-=job.reservation;ledger.spent+=actual;job.actual+=actual;job.reservation=0;
}
export class NarrationGovernance {
  constructor(private store:SqliteGovernanceStore,private identity:IdentityVerifier,private sources:SourceAuthority,private voices:VoiceAuthority,private objects:PrivateObjects,private now:()=>number=Date.now) {}
  private event(l:Ledger,actor:string,action:string,request:string,job:Job|undefined,from:Job['state']|null,outcome:AuditEvent['outcome']) {
    const body={sequence:l.events.length+1,actor,action,request_id:request,job_id:job?.id??null,at:this.now(),from,to:job?.state??null,outcome,policy_version:POLICY_VERSION,binding:job?digest(canonical({source:job.source,voice:job.voice,asset:job.asset??null})):null,previous:l.events.at(-1)?.hash??digest('ADR-0032/audit/v1')};
    l.events.push({...body,hash:digest(canonical(body))});
  }
  private act<T>(actor:VerifiedIdentity,role:Role,action:string,request:string,id:string|undefined,operation:(l:Ledger,j:Job|undefined)=>T):T {
    identifier.parse(request);if(id) identifier.parse(id);
    let failure:unknown;let result:T|undefined;
    this.store.transaction(l=>{
      const j=id && Object.hasOwn(l.jobs,id)?l.jobs[id]:undefined;const from=j?.state??null;
      // Savepoint semantics: failed operations keep denial evidence, never partial state.
      const before=structuredClone(l);
      try {
        this.identity.authorize(actor,role);
        if(Object.hasOwn(l.requests,request)) throw new GovernanceError('REPLAY');
        if(id && !j) throw new GovernanceError('INVALID');
        result=operation(l,j);l.requests[request]=true;
        this.event(l,actor.subject,action,request,j,from,'allowed');
      } catch(error) {
        Object.assign(l,before);failure=error;
        if(error instanceof GovernanceError && error.code==='STALE' && id && Object.hasOwn(l.jobs,id) && l.jobs[id].state!=='STALE') {
          const stale=l.jobs[id];transition(stale.state,'STALE');stale.state='STALE';stale.lease=null;stale.fence++;settle(l,stale,0);delete stale.approval;
        }
        this.event(l,'unverified',action,request,id && Object.hasOwn(l.jobs,id)?l.jobs[id]:undefined,from,'denied');
      }
    });
    if(failure) throw failure;return result as T;
  }
  private fresh(j:Job) {
    const current=SourceSchema.parse(this.sources.current(j.source.canonical_id,j.source.locale));
    const voice=VoiceSchema.parse(this.voices.current(j.source.canonical_id,j.source.locale));
    // Unrelated Git changes need not invalidate exact extracted article bytes.
    if(current.canonical_id!==j.source.canonical_id || current.locale!==j.source.locale || current.parser_version!==j.source.parser_version || current.source_sha256!==j.source.source_sha256 || canonical(voice)!==canonical(j.voice)) throw new GovernanceError('STALE');
  }
  submit(actor:VerifiedIdentity,request:string,input:unknown):Job {
    const source=SourceSchema.parse(input);return this.act(actor,'Generator','submit',request,undefined,l=>{
      const voice=VoiceSchema.parse(this.voices.current(source.canonical_id,source.locale));
      if(voice.language!==source.locale) throw new GovernanceError('INVALID');
      const current=SourceSchema.parse(this.sources.current(source.canonical_id,source.locale));
      if(canonical(current)!==canonical(source)) throw new GovernanceError('STALE');
      const key=digest(canonical({canonical_id:source.canonical_id,locale:source.locale,source_sha256:source.source_sha256,parser_version:source.parser_version,voice,narration_version:1}));const existing=Object.values(l.jobs).find(j=>j.key===key);
      if(existing) return structuredClone(existing);
      const j:Job={id:randomUUID(),key,source,voice,version:1,creator:actor.subject,state:'DRAFT',attempt:0,fence:0,lease:null,reservation:0,actual:0};
      l.jobs[j.id]=j;return structuredClone(j);
    });
  }
  claim(actor:VerifiedIdentity,request:string,id:string):Job {
    return this.act(actor,'Generator','claim',request,id,(l,j)=>{
      if(!j || j.state!=='DRAFT' || j.attempt>=3 || (j.lease && j.lease.until>this.now())) throw new GovernanceError('LEASE');
      this.fresh(j);
      if(j.voice.provider!=='mock' || SAFETY.productionTtsEnabled || SAFETY.costAuthorized || SAFETY.maxSpendUsd!==0) throw new GovernanceError('DISABLED');
      // An expired claim never authorizes a second paid provider invocation. Only mock work is available.
      settle(l,j,0);reserve(l,j,0);j.fence++;j.attempt++;j.lease={worker:actor.subject,until:this.now()+30000};return structuredClone(j);
    });
  }
  private leased(j:Job|undefined,actor:VerifiedIdentity,fence:number):Job {
    if(!j || j.state!=='DRAFT' || !j.lease || j.lease.worker!==actor.subject || j.lease.until<=this.now() || j.fence!==fence) throw new GovernanceError('LEASE');return j;
  }
  complete(actor:VerifiedIdentity,request:string,id:string,fence:number,bytes:Uint8Array):Job {
    return this.act(actor,'Generator','complete',request,id,(l,j)=>{
      j=this.leased(j,actor,fence);this.fresh(j);
      if(!(bytes instanceof Uint8Array) || bytes.length===0 || bytes.length>20_000_000) throw new GovernanceError('INVALID');
      const hash=digest(bytes);const assetId=digest(canonical({job:j.id,source:j.source,voice:j.voice,hash,version:j.version}));
      this.objects.putExclusive(hash,bytes);
      if(digest(this.objects.read(hash))!==hash) throw new GovernanceError('INTEGRITY');
      j.asset=AssetSchema.parse({asset_id:assetId,source:j.source,voice_config_sha256:digest(canonical(j.voice)),audio_sha256:hash,narration_version:j.version,owner:j.creator,synthetic_disclosure:'AI-generated narration; not Paul Zhang’s recorded voice',kind:'mock',object_key:hash});
      settle(l,j,0);j.lease=null;transition(j.state,'GENERATED');j.state='GENERATED';transition(j.state,'PENDING_REVIEW');j.state='PENDING_REVIEW';return structuredClone(j);
    });
  }
  fail(actor:VerifiedIdentity,request:string,id:string,fence:number) {
    return this.act(actor,'Generator','fail',request,id,(l,j)=>{j=this.leased(j,actor,fence);settle(l,j,0);j.lease=null;transition(j.state,'FAILED');j.state='FAILED';});
  }
  recover(actor:VerifiedIdentity,request:string,id:string) {
    return this.act(actor,'Generator','recover',request,id,(_l,j)=>{if(!j || j.attempt>=3) throw new GovernanceError('STATE');this.fresh(j);transition(j.state,'DRAFT');j.state='DRAFT';});
  }
  review(actor:VerifiedIdentity,request:string,id:string,decision:'approve'|'reject',humanListening:boolean) {
    return this.act(actor,'Reviewer','review',request,id,(_l,j)=>{
      if(!j || !j.asset || j.state!=='PENDING_REVIEW' || !['approve','reject'].includes(decision)) throw new GovernanceError('STATE');
      this.fresh(j);AssetSchema.parse(j.asset);
      if(digest(this.objects.read(j.asset.object_key))!==j.asset.audio_sha256) throw new GovernanceError('INTEGRITY');
      if(actor.subject===j.creator) throw new GovernanceError('DENIED');
      if(decision==='approve' && humanListening!==true) throw new GovernanceError('DENIED');
      const to=decision==='approve'?'APPROVED':'REJECTED';transition(j.state,to);j.state=to;
      if(to==='APPROVED') j.approval={asset:structuredClone(j.asset),reviewer_subject:actor.subject,at:this.now(),policy_version:POLICY_VERSION,human_listening:true,session_id:actor.session};
    });
  }
  publish(actor:VerifiedIdentity,request:string,id:string) {
    return this.act(actor,'Publisher','publish',request,id,(_l,j)=>{
      if(!j || j.state!=='APPROVED' || !j.asset || !j.approval || canonical(j.approval.asset)!==canonical(j.asset)) throw new GovernanceError('DENIED');
      this.fresh(j);if(digest(this.objects.read(j.asset.object_key))!==j.asset.audio_sha256) throw new GovernanceError('INTEGRITY');
      // No promotion adapter is available. Even verified approval cannot activate production.
      throw new GovernanceError('DISABLED');
    });
  }
  revoke(actor:VerifiedIdentity,request:string,id:string) {
    return this.act(actor,'Reviewer','revoke',request,id,(_l,j)=>{if(!j || !j.approval || j.approval.reviewer_subject!==actor.subject) throw new GovernanceError('DENIED');transition(j.state,'REJECTED');j.state='REJECTED';delete j.approval;});
  }
  invalidate(actor:VerifiedIdentity,request:string,id:string) {
    return this.act(actor,'Generator','invalidate',request,id,(l,j)=>{
      if(!j) throw new GovernanceError('INVALID');
      try {this.fresh(j);throw new GovernanceError('STATE');} catch(error) {if(!(error instanceof GovernanceError) || error.code!=='STALE') throw error;}
      transition(j.state,'STALE');j.state='STALE';j.lease=null;j.fence++;settle(l,j,0);delete j.approval;
    });
  }
  readAsset(actor:VerifiedIdentity,id:string):Uint8Array {
    this.identity.authorize(actor,'Reviewer');const j=this.store.snapshot().jobs[identifier.parse(id)];
    if(!j?.asset || j.state==='STALE' || j.state==='REJECTED') throw new GovernanceError('DENIED');this.fresh(j);
    const bytes=this.objects.read(j.asset.object_key);if(digest(bytes)!==j.asset.audio_sha256) throw new GovernanceError('INTEGRITY');return bytes;
  }
}
