import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {randomBytes,timingSafeEqual} from 'node:crypto';
import {Store,MAX_UPLOAD,safePath,digest} from './store';import {prepare,splitSource,type Proposal} from './content';import {Worker} from './worker';import {GitHub,Waiting} from './github';import {codexPreflight} from './executor';import {nativeHelper} from './native-auth';import {run} from './process';
function secretEqual(a:unknown,b:string){return typeof a==='string'&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));}
async function readRequest(req:http.IncomingMessage,limit:number){const chunks:Buffer[]=[];let size=0;for await(const b of req){size+=b.length;if(size>limit)throw Error('Request too large');chunks.push(b);}return Buffer.concat(chunks);}
export async function startStudio(options:{root:string;port?:number;repo?:string;vault?:string}) {
 const repo=options.repo||process.cwd();const relative=path.relative(path.resolve(repo),path.resolve(options.root));if(!relative.startsWith('..'+path.sep)&&relative!=='..')throw Error('Job storage must be outside the website repository');
 const store=await Store.open(options.root);
 // A process lock serializes all repository and archive mutations across instances.
 const lock=await safePath(store.root,'studio.lock');
 try {const pid=Number(await fs.readFile(lock,'utf8'));try{process.kill(pid,0);throw Error('Studio already running');}catch(e){if((e as NodeJS.ErrnoException).code!=='ESRCH')throw e;}await fs.unlink(lock);}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 await store.exclusive(lock,String(process.pid));
 const worker=new Worker(store,repo,options.vault);const key=randomBytes(32).toString('hex'),session=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');let used=false,origin='',running=false,probing=false;
 let workerEvidence:unknown={authenticated:false,reason:'Not tested'};let githubEvidence:unknown={authenticated:false,reason:'Not tested; configure credentials locally, then run one read-only check'};let githubChecking=false;
 try{const dir=path.join(store.root,'connection-probe');const response=JSON.parse(await fs.readFile(path.join(dir,'response.json'),'utf8'));const events=await fs.readFile(path.join(dir,'executor-private.jsonl'));if(response.ready===true)workerEvidence={authenticated:true,nonce:response.nonce,eventsHash:digest(events),at:(await fs.stat(path.join(dir,'response.json'))).mtime.toISOString()};}catch{/* No authenticated execution evidence retained. */}
 try{const lines=(await fs.readFile(path.join(store.root,'auth-evidence.jsonl'),'utf8')).trim().split('\n');const evidence=JSON.parse(lines[lines.length-1]);if(evidence.authenticated===true)githubEvidence=evidence;}catch{/* No completed owner authorization retained. */}
 const html=await fs.readFile(new URL('./ui.html',import.meta.url),'utf8');
 const server=http.createServer(async(req,res)=>{
 const send=(status:number,value:unknown)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));};
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
 try {
 if(req.headers.host!==origin.slice(7))return send(403,{error:'Host rejected'});
 const url=new URL(req.url!,origin);
 if(req.method==='GET'&&url.pathname==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(html);}
 if(req.method==='GET'&&['/ui.js','/ui.css'].includes(url.pathname)){res.setHeader('Content-Type',url.pathname.endsWith('.js')?'text/javascript':'text/css');return res.end(await fs.readFile(new URL('.'+url.pathname,import.meta.url)));}
 if(req.method==='POST'&&url.pathname==='/session') {
 if(req.headers.origin!==origin)return send(403,{error:'Origin rejected'});
 const body=JSON.parse((await readRequest(req,1024)).toString());if(used||!secretEqual(body.key,key))return send(403,{error:'Session key rejected; restart Studio for a new key'});
 used=true;res.setHeader('Set-Cookie',`studio=${session}; HttpOnly; SameSite=Strict; Path=/`);return send(200,{csrf});
 }
 const cookie=req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('studio='))?.slice(7);
 if(!secretEqual(cookie,session)||!used)return send(403,{error:'Owner session required'});
 if(req.method!=='GET'&&(req.headers.origin!==origin||!secretEqual(req.headers['x-csrf-token'],csrf)))return send(403,{error:'Origin / CSRF rejected'});
 if(req.method==='GET'&&url.pathname==='/api/session')return send(200,{csrf});
 if(req.method==='GET'&&url.pathname==='/api/jobs')return send(200,await store.list());
 if(req.method==='GET'&&url.pathname==='/api/status')return send(200,{worker:workerEvidence,github:githubEvidence,githubChecking,running,probing,vaultConfigured:!!options.vault});
 if(req.method==='POST'&&url.pathname==='/api/upload') {
 if(running)return send(409,{error:'Worker active; wait before editing jobs'});
 const job=await store.upload(url.searchParams.get('name')||'',await readRequest(req,MAX_UPLOAD));
 let metadata={};try{metadata=splitSource((await store.bytes(job.id)).toString()).metadata;await store.transition(job.id,{metadata});}catch{/* Keep malformed original durable; validation explains it. */}
 return send(200,{...job,metadata});
 }
 if(req.method==='GET'&&url.pathname==='/api/source'){const job=await store.get(url.searchParams.get('id')||'');return send(200,{source:(await store.bytes(job.id)).toString(),job});}
 if(req.method==='POST'&&url.pathname==='/api/github-authorize') {
 if(githubChecking||running||probing)return send(409,{error:'Authorization or worker busy'});githubChecking=true;
 void nativeHelper().then(helper=>run(helper,['authorize'],repo,undefined,600000)).then(async output=>{const evidence=JSON.parse(output);githubEvidence=evidence;await fs.appendFile(path.join(store.root,'auth-evidence.jsonl'),JSON.stringify(evidence)+'\n',{mode:0o600});if(evidence.authenticated)githubEvidence=await (await GitHub.connect(repo)).readiness(repo);}).catch(()=>{githubEvidence={authenticated:false,reason:'Native authorization cancelled or failed; no secret in diagnostics'};}).finally(()=>{githubChecking=false;});return send(202,{queued:true});
 }
 if(req.method==='POST'&&url.pathname==='/api/github-check') {
 if(githubChecking||running)return send(409,{error:'Worker busy'});githubChecking=true;
 void GitHub.connect(repo).then(gh=>gh.readiness(repo)).then(e=>{githubEvidence=e;}).catch(e=>{githubEvidence={authenticated:false,reason:e instanceof Waiting?e.message:'GitHub read-only check failed; inspect credentials, selected repository and network locally'};}).finally(()=>{githubChecking=false;});return send(202,{queued:true});
 }
 if(req.method==='POST'&&url.pathname==='/api/probe') {
 if(probing||running)return send(409,{error:'Worker busy'});probing=true;
 void codexPreflight(path.join(store.root,'connection-probe'),{mode:'connection-probe'}).then(e=>{workerEvidence=e;}).catch(()=>{workerEvidence={authenticated:false,reason:'Execution failed; inspect private connection-probe diagnostics'};}).finally(()=>{probing=false;});
 return send(202,{queued:true});
 }
 if(req.method==='POST'&&['/api/validate','/api/publish','/api/resume'].includes(url.pathname)) {
 if(running)return send(409,{error:'Worker busy'});
 const body=JSON.parse((await readRequest(req,65536)).toString());const job=await store.get(body.id);
 if(url.pathname==='/api/validate') {
 if(job.approval)throw Error('Approved job immutable; upload a new version');
 const proposal=body.proposal as Proposal;
 try {const prepared=prepare((await store.bytes(job.id)).toString(),proposal,repo);await store.transition(job.id,{stage:'Validated',proposal,versionHash:prepared.versionHash,version:prepared.version,waiting:null});return send(200,prepared);}
 catch(e){await store.transition(job.id,{stage:'Uploaded',waiting:'Metadata/content validation needs correction'});throw e;}
 }
 if(url.pathname==='/api/publish') {
 if(job.approval)throw Error('Already approved: use resume');
 if(job.stage!=='Validated')throw Error('Validate before approval');
 const prepared=prepare((await store.bytes(job.id)).toString(),job.proposal as Proposal,repo);
 if(body.versionHash!==prepared.versionHash||job.versionHash!==prepared.versionHash)throw Error('Approval hash changed');
 await store.exclusive(path.join(await store.dir(job.id),'approved.md'),prepared.output);
 await store.transition(job.id,{approval:{...prepared.version,versionHash:prepared.versionHash,intent:'publish',at:new Date().toISOString(),ownerAction:'authenticated local button',sessionFingerprint:digest(session)},stage:'Publishing',waiting:null});
 }else if(!job.approval)throw Error('No bound owner approval');
 running=true;void worker.resume(job.id).catch(async()=>{await store.transition(job.id,{stage:'Failed',waiting:'Worker dispatch failed'});}).finally(()=>{running=false;});return send(202,{queued:true,id:job.id});
 }
 return send(404,{error:'Not found'});
 }catch(e){return send(400,{error:e instanceof Error?e.message:'Request failed'});}
 });
 try {await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(options.port??4318,'127.0.0.1',()=>resolve());});}
 catch(e){await fs.unlink(lock);throw e;}
 const observer=setInterval(()=>{if(running||probing)return;void store.list().then(jobs=>{const job=jobs.find(j=>j.approval&&j.stage!=='Failed'&&j.stage!=='Archived'&&((typeof j.nextObservationAt==='string'&&j.nextObservationAt<=new Date().toISOString())||(!j.waiting&&j.stage==='Publishing')));if(job&&!running){running=true;void worker.resume(job.id).catch(()=>{/* Durable state remains for operator recovery. */}).finally(()=>{running=false;});}}).catch(()=>{/* Corrupt state is never auto-replayed. */});},5000);
 const address=server.address() as import('node:net').AddressInfo;origin=`http://127.0.0.1:${address.port}`;
 return {origin,key,store,close:async()=>{if(running||probing||githubChecking)throw Error('Worker active; wait before stopping Studio');clearInterval(observer);await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));await fs.unlink(lock);}};
}
