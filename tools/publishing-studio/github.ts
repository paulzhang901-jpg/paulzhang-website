import {run} from './process';import {gitAuthEnvironment} from './credentials';import {keychainToken} from './native-auth';
type ApiRecord={ [key:string]: ApiValue };
type ApiValue=string|number|boolean|null|ApiRecord|ApiValue[];
export type Pull={number:number;html_url:string;head:{sha:string};merged:boolean;state:string;mergeable:boolean;mergeable_state:string;merge_commit_sha:string};
type Check={name:string;status:string;conclusion:string};
type Run={id:number;head_sha:string;status:string;conclusion:string;html_url:string;updated_at:string};
const REPO='paulzhang901-jpg/paulzhang-website';
export class Waiting extends Error {}
export class GitHub {
 constructor(private token:string){}
 static async connect(_cwd:string) {
 void _cwd;
 let token:string|undefined;
 try{token=await keychainToken();}catch{throw new Waiting('macOS Keychain access unavailable; use GitHub 安全授权 in Studio');}
 if(!token)throw new Waiting('GitHub credentials unavailable: click GitHub 安全授权 and enter token in the native secure window');
 return new GitHub(token);
 }
 async commitIdentity() {
 const response=await fetch('https://api.github.com/user',{headers:{Authorization:`Bearer ${this.token}`,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Waiting('GitHub actor identity unavailable');const actor=await response.json() as {id:number;login:string;name:string|null};if(!Number.isSafeInteger(actor.id)||!/^[-a-zA-Z0-9]+$/.test(actor.login))throw Error('Invalid GitHub actor');return {name:(actor.name||actor.login).replace(/[\r\n\x00]/g,''),email:`${actor.id}+${actor.login}@users.noreply.github.com`};
 }
 async push(cwd:string,head:string,branch:string) {
 if(!/^[0-9a-f]{40}$/.test(head)||!/^codex\/studio-[0-9a-f-]{36}$/.test(branch))throw Error('Invalid scoped push');
 try{return await run('git',['push','origin',`${head}:refs/heads/${branch}`],cwd,undefined,120000,gitAuthEnvironment(this.token));}
 catch{throw new Waiting('GitHub push denied or unavailable; check Contents write permission and network; no automatic retry');}
 }
 async readiness(cwd:string) {
 const repo=await this.request<{full_name:string;permissions?:{push:boolean}}>('');
 await this.request('pulls?state=open&per_page=1');
 await this.request('actions/workflows/architecture-validation.yml/runs?per_page=1');
 await run('git',['ls-remote','origin','refs/heads/main'],cwd,undefined,30000,gitAuthEnvironment(this.token));
 return {authenticated:true,repository:repo.full_name,pushPermission:repo.permissions?.push===true,readEndpointsVerified:true,writePermissionVerified:false,reason:'Write permission is proven only by the exact owner-approved article PR; this probe makes no remote changes'};
 }
 async request<T=ApiRecord>(endpoint:string,method='GET',body?:unknown):Promise<T> {
 const response=await fetch(`https://api.github.com/repos/${REPO}${endpoint?'/'+endpoint:''}`,{method,headers:{Authorization:`Bearer ${this.token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});
 if(!response.ok) {if([401,403].includes(response.status))throw new Waiting(`GitHub permission required (${response.status})`);throw Error(`GitHub ${method} ${endpoint.split('?')[0]}: HTTP ${response.status}`);}
 return response.status===204?null as T:response.json();
 }
 async findPR(branch:string) {const prs=await this.request<Pull[]>(`pulls?state=all&head=paulzhang901-jpg:${encodeURIComponent(branch)}&base=main`);if(prs.length>1)throw Error('Multiple PRs for job');return prs[0];}
 async protectedMerge(number:number,head:string) {
 const pr=await this.request<Pull>(`pulls/${number}`);
 if(pr.head.sha!==head)throw Error('PR head changed');
 if(pr.merged)return pr;
 if(pr.state!=='open')throw Error('PR closed without merge');
 const checks=await this.request<{total_count:number;check_runs:Check[]}>(`commits/${head}/check-runs?per_page=100`);
 const statuses=await this.request<{statuses:Array<{state:string}>}>(`commits/${head}/status`);
 if(checks.total_count>100)throw Error('Check pagination requires operator review');
 if(checks.check_runs.some((c)=>c.status==='completed'&&!['success','neutral','skipped'].includes(c.conclusion))||statuses.statuses.some((s)=>['failure','error'].includes(s.state)))throw Error('GitHub checks failed');
 if(!checks.check_runs.some((c)=>c.name==='validate'&&c.conclusion==='success')||checks.check_runs.some((c)=>c.status!=='completed')||statuses.statuses.some((s)=>s.state==='pending'))throw new Waiting('Required GitHub checks pending');
 // GitHub computes review/branch protection; never admin-merge or self-approve.
 if(pr.mergeable!==true||pr.mergeable_state!=='clean')throw new Waiting('GitHub protection/review requirements pending: '+pr.mergeable_state);
 const result=await this.request(`pulls/${number}/merge`,'PUT',{sha:head,merge_method:'merge'});
 if(!result.merged)throw new Waiting('Protected merge not accepted');
 return this.request<Pull>(`pulls/${number}`);
 }
 async production(commit:string) {
 const runs=await this.request<{workflow_runs:Run[]}>(`actions/workflows/architecture-validation.yml/runs?branch=main&event=push&head_sha=${commit}&per_page=100`);
 const run=runs.workflow_runs.find((r)=>r.head_sha===commit);
 if(!run)throw new Waiting('Matching main deployment not started');
 if(run.status!=='completed')throw new Waiting('Matching main deployment running');
 if(run.conclusion!=='success')throw Error('Main quality/deployment workflow failed');
 const jobs=await this.request<{jobs:Array<{name:string;conclusion:string}>}>(`actions/runs/${run.id}/jobs?per_page=100`);
 if(!jobs.jobs.some((j)=>j.name==='Deploy production'&&j.conclusion==='success'))throw Error('Matching production job not successful');
 return {runId:run.id,commit,url:run.html_url,completedAt:run.updated_at};
 }
}
