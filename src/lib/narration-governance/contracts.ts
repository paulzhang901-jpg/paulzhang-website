import {createHash} from 'node:crypto';
import {z} from 'zod';

export const SAFETY = Object.freeze({productionTtsEnabled:false, costAuthorized:false, maxSpendUsd:0});
export const POLICY_VERSION = 'ADR-0032/v1';
export class GovernanceError extends Error {
  constructor(public readonly code: 'INVALID'|'DENIED'|'REPLAY'|'STALE'|'LEASE'|'BUDGET'|'STATE'|'INTEGRITY'|'DISABLED') {super(code);}
}
export const digest = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex');
export function canonical(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  if (typeof value === 'object' && value && Object.getPrototypeOf(value) === Object.prototype) {
    return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical((value as Record<string,unknown>)[k])).join(',')+'}';
  }
  throw new GovernanceError('INVALID');
}
const hash = z.string().regex(/^[a-f0-9]{64}$/);
export const identifier = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/);
export const SourceSchema = z.object({canonical_id:identifier,locale:z.enum(['zh-CN','en-US']),commit:z.string().regex(/^[a-f0-9]{40}$/),parser_version:z.literal('phase6c/v1'),source_sha256:hash}).strict();
export type SourceRef = z.infer<typeof SourceSchema>;
export const VoiceSchema = z.object({provider:identifier,model:identifier,voice:identifier,language:z.enum(['zh-CN','en-US']),format:z.enum(['wav','mp3']),speed:z.number().finite().positive().max(4),version:z.number().int().positive(),instructions:z.string().max(2000)}).strict();
export type VoiceConfig = z.infer<typeof VoiceSchema>;
export const AssetSchema = z.object({asset_id:hash,source:SourceSchema,voice_config_sha256:hash,audio_sha256:hash,narration_version:z.number().int().positive(),owner:identifier,synthetic_disclosure:z.literal('AI-generated narration; not Paul Zhang’s recorded voice'),kind:z.enum(['mock','production']),object_key:hash}).strict();
export type AssetRef = z.infer<typeof AssetSchema>;
export type Role = 'Generator'|'Reviewer'|'Publisher'|'Administrator';
export type State = 'DRAFT'|'GENERATED'|'PENDING_REVIEW'|'APPROVED'|'PUBLISHED'|'REJECTED'|'FAILED'|'STALE';
const transitions: Record<State,readonly State[]> = {DRAFT:['GENERATED','FAILED','STALE'],GENERATED:['PENDING_REVIEW','STALE'],PENDING_REVIEW:['APPROVED','REJECTED','STALE'],APPROVED:['PUBLISHED','REJECTED','STALE'],PUBLISHED:['REJECTED','STALE'],REJECTED:['STALE'],FAILED:['DRAFT','STALE'],STALE:[]};
export function transition(from:State,to:State) {if(!transitions[from]?.includes(to)) throw new GovernanceError('STATE');}
export interface Approval {asset:AssetRef; reviewer_subject:string; at:number; policy_version:string; human_listening:true; session_id:string;}
export interface Job {id:string; key:string; source:SourceRef; voice:VoiceConfig; version:number; creator:string; state:State; attempt:number; fence:number; lease:null|{worker:string;until:number}; reservation:number; actual:number; asset?:AssetRef; approval?:Approval;}
export interface AuditEvent {sequence:number;actor:string;action:string;request_id:string;job_id:string|null;at:number;from:State|null;to:State|null;outcome:'allowed'|'denied';policy_version:string;binding:string|null;previous:string;hash:string;}
export interface Ledger {jobs:Record<string,Job>;requests:Record<string,true>;reserved:number;spent:number;cap:number;events:AuditEvent[];}
export interface SourceAuthority {current(id:string,locale:SourceRef['locale']):SourceRef;}
export interface VoiceAuthority {current(id:string,locale:SourceRef['locale']):VoiceConfig;}
export interface PrivateObjects {read(key:string):Uint8Array;putExclusive(key:string,bytes:Uint8Array):void;}

export const JobSchema = z.object({id:identifier,key:hash,source:SourceSchema,voice:VoiceSchema,version:z.number().int().positive(),creator:identifier,state:z.enum(['DRAFT','GENERATED','PENDING_REVIEW','APPROVED','PUBLISHED','REJECTED','FAILED','STALE']),attempt:z.number().int().nonnegative().max(3),fence:z.number().int().nonnegative(),lease:z.object({worker:identifier,until:z.number().int().nonnegative()}).strict().nullable(),reservation:z.number().int().nonnegative(),actual:z.number().int().nonnegative(),asset:AssetSchema.optional(),approval:z.object({asset:AssetSchema,reviewer_subject:identifier,at:z.number().int().nonnegative(),policy_version:z.literal(POLICY_VERSION),human_listening:z.literal(true),session_id:identifier}).strict().optional()}).strict();
export const LedgerSchema=z.object({jobs:z.record(identifier,JobSchema),requests:z.record(identifier,z.literal(true)),reserved:z.number().int().nonnegative(),spent:z.number().int().nonnegative(),cap:z.number().int().nonnegative(),events:z.array(z.object({sequence:z.number().int().positive(),actor:identifier,action:identifier,request_id:identifier,job_id:identifier.nullable(),at:z.number().int().nonnegative(),from:z.string().nullable(),to:z.string().nullable(),outcome:z.enum(['allowed','denied']),policy_version:z.literal(POLICY_VERSION),binding:hash.nullable(),previous:hash,hash}).strict())}).strict();
