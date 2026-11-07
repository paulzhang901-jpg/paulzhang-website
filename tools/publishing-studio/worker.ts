import {createProcessor} from '@mdx-js/mdx';
import fs from 'node:fs/promises';import path from 'node:path';
import {Store,digest,safePath} from './store';import {prepare,type Proposal} from './content';import {run} from './process';import {codexPreflight} from './executor';import {GitHub,Waiting,type Pull} from './github';import {archiveArticle} from './archive';
export function approvalMatches(approval:unknown,versionHash:string,intent:'publish'|'prepare-pr'='publish') {const a=approval as Record<string,unknown>|undefined;return a?.intent===intent&&a.versionHash===versionHash;}
export async function verifyWebsite(expected:{url:string;title:string;body:string},fetcher:typeof fetch=fetch) {
 const response=await fetcher(expected.url,{redirect:'manual',signal:AbortSignal.timeout(30000),headers:{'Cache-Control':'no-cache'}});
 const html=await response.text();
 const canonical=/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i.exec(html)?.[1]||/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i.exec(html)?.[1];
 const article=/<article\b[^>]*>([\s\S]*?)<\/article>/i.exec(html)?.[1]||html;
 const plain=article.replace(/<(script|style)[\s\S]*?<\/\1>/gi,'').replace(/<img\b[^>]*alt=["']([^"']*)["'][^>]*>/gi,'$1').replace(/<[^>]+>/g,'').replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&quot;/g,'"').replace(/&#x27;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');
 const normalize=(s:string)=>s.replace(/\s+/g,'');
 type MarkdownNode={type?:string;value?:string;alt?:string;children?:MarkdownNode[]};
 const tokens:string[]=[];const walk=(node:MarkdownNode)=>{if(['text','inlineCode','code'].includes(node.type||'')&&node.value)tokens.push(normalize(node.value));if(node.type==='image'&&node.alt)tokens.push(normalize(node.alt));for(const child of node.children||[])walk(child);};
 walk(createProcessor({format:'md'}).parse(expected.body) as MarkdownNode);
 const normalized=normalize(plain);let cursor=0,matched=true;
 for(const token of tokens.filter(Boolean)){const at=normalized.indexOf(token,cursor);if(at<0){matched=false;break;}cursor=at+token.length;}
 if(response.status!==200||canonical!==expected.url||!plain.includes(expected.title)||!tokens.some(Boolean)||!matched)throw Error('Website verification failed: status/canonical/title/body');
 return {url:expected.url,at:new Date().toISOString(),htmlHash:digest(html),bodyHash:digest(expected.body)};
}
export class Worker {
 private busy=false;
 constructor(private store:Store,private repo:string,private vault?:string,private connectGitHub=GitHub.connect){}
 async resume(id:string) {
 if(this.busy)throw Error('Worker busy; retry later');this.busy=true;
 try {await this.execute(id);}finally{this.busy=false;}
 }
 private async execute(id:string) {
 let step='approval';const dir=await this.store.dir(id);
 try {
 let job=await this.store.get(id);const source=(await this.store.bytes(id)).toString('utf8');
 const prepared=prepare(source,job.proposal as Proposal,this.repo,job.head?job.version as {destination:string;outputHash:string}:undefined);
 const prOnly=job.preparationOnly===true;
 if(!approvalMatches(prOnly?job.preparationApproval:job.approval,prepared.versionHash,prOnly?'prepare-pr':'publish'))throw Error('Approval hash changed or missing');
 if(job.stage==='Archived')return;
 const output=await fs.readFile(path.join(dir,'approved.md'),'utf8');if(digest(output)!==prepared.version.outputHash)throw Error('Approved output hash changed');
 step='github-auth';const github=await this.connectGitHub(this.repo);
 if(!job.githubReadiness){const githubReadiness=await github.readiness(this.repo);await this.store.transition(id,{githubReadiness});}
 step='codex';
 if(!job.executor) {const executor=await codexPreflight(path.join(dir,'executor'),{...prepared.version,intent:prOnly?'prepare-pr':'publish'});await this.store.transition(id,{executor});}
 step='worktree';if(await run('git',['remote','get-url','origin'],this.repo)!=='https://github.com/paulzhang901-jpg/paulzhang-website.git')throw Error('Unexpected repository remote');const worktree=path.join(dir,'website-worktree'),branch=`codex/studio-${id}`;
 await run('git',['fetch','origin','main'],this.repo);
 try{await fs.access(worktree);}catch{await run('git',['worktree','add','-b',branch,worktree,'origin/main'],this.repo);}
 if(await run('git',['branch','--show-current'],worktree)!==branch)throw Error('Unexpected job branch');
 const destination=await safePath(worktree,prepared.destination);
 job=await this.store.get(id);
 let head=job.head as string|undefined;
 if(!head) {
  const already=await run('git',['log','-1','--format=%s'],worktree);
  if(already===`Publish approved Studio job ${id}`) {
   const files=await run('git',['diff-tree','--no-commit-id','--name-status','-r','HEAD'],worktree);
   if(files!==`A\t${prepared.destination}`)throw Error('Recovered commit scope mismatch');head=await run('git',['rev-parse','HEAD'],worktree);
  }else {
   // Re-validate against freshly fetched main, including collision detection.
   const base=await run('git',['rev-parse','HEAD'],worktree),latest=await run('git',['rev-parse','origin/main'],this.repo);
   if(base!==latest)throw Error('Main changed before commit; revalidation required');
   try {const bytes=await fs.readFile(destination,'utf8');if(bytes!==output)throw Error('Destination conflict');}
   catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;prepare(source,job.proposal as Proposal,worktree);const h=await fs.open(destination,'wx',0o600);try{await h.writeFile(output);await h.sync();}finally{await h.close();}}
   const unexpected=await run('git',['diff','--name-only'],worktree);const staged=await run('git',['diff','--cached','--name-only'],worktree);const untracked=await run('git',['ls-files','--others','--exclude-standard','-z'],worktree);
   const paths=untracked.split('\0').filter(Boolean);if(paths.includes('node_modules')){const link=path.join(worktree,'node_modules');if(!(await fs.lstat(link)).isSymbolicLink()||await fs.readlink(link)!==path.join(this.repo,'node_modules'))throw Error('Unexpected dependency path');paths.splice(paths.indexOf('node_modules'),1);}
   const recoveredStaged=staged===prepared.destination&&!!job.validationFingerprint&&await run('git',['diff','--cached','--name-status'],worktree)===`A\t${prepared.destination}`&&await run('git',['rev-parse',`:${prepared.destination}`],worktree)===await run('git',['hash-object','--stdin'],worktree,output);
   if(unexpected||(staged&&!recoveredStaged)||(recoveredStaged?paths.length!==0:paths.length!==1||paths[0]!==prepared.destination))throw Error('Unexpected publication diff');
   step='validation';
   // Use the existing locked dependencies; all validators run in the job worktree.
   const modules=path.join(worktree,'node_modules');let install=false;try{const stat=await fs.lstat(modules);if(stat.isSymbolicLink()){if(await fs.readlink(modules)!==path.join(this.repo,'node_modules'))throw Error('Unexpected dependency symlink');await fs.unlink(modules);install=true;}}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;install=true;}if(install)await run('pnpm',['install','--frozen-lockfile','--ignore-scripts','--offline'],worktree,undefined,180000);
   const commands=[['validate:architecture'],['test:architecture'],['validate:content'],['test:content-integrity'],['test:translation'],['test:security'],['lint'],['typecheck'],['test:routes'],['test:product'],['test:accessibility'],['test:performance'],['test:narration-governance'],['build'],['validate:static-export']];
   const fingerprint=digest(base+'\n'+prepared.version.outputHash+'\n'+await fs.readFile(path.join(worktree,'pnpm-lock.yaml'),'utf8'));
   const resumeIndex=job.validationFingerprint===fingerprint?commands.findIndex(([name])=>name===job.lastPassedGate):-1;
   await this.store.transition(id,{validationFingerprint:fingerprint});
   for(const [script] of commands.slice(resumeIndex+1)) {if(script==='build')await run(process.execPath,[path.join(worktree,'node_modules/next/dist/bin/next'),'build'],worktree,undefined,600000);else await run('pnpm',['run',script],worktree,undefined,600000);await this.store.transition(id,{lastPassedGate:script});}
   await run('git',['add','--',prepared.destination],worktree);await run('git',['-c','core.whitespace=cr-at-eol','diff','--cached','--check'],worktree);
   if(await run('git',['diff','--cached','--name-status'],worktree)!==`A\t${prepared.destination}`)throw Error('Unexpected scoped diff');
   const identity=await github.commitIdentity();await run('git',['-c',`user.name=${identity.name}`,'-c',`user.email=${identity.email}`,'commit','-m',`Publish approved Studio job ${id}`],worktree);head=await run('git',['rev-parse','HEAD'],worktree);
  }
  await this.store.transition(id,{head,branch,scopedDiff:`A ${prepared.destination}`});
 }
 if(await run('git',['rev-parse','HEAD'],worktree)!==head||await run('git',['status','--porcelain'],worktree))throw Error('Worktree changed since approval commit');
 if(await run('git',['rev-parse',`${head}:${prepared.destination}`],worktree)!==await run('git',['hash-object','--stdin'],worktree,output))throw Error('Committed body mismatch');
 step='pr';
 // Observe before every retry; a crash after push/create/merge never blindly replays it.
 let pr=await github.findPR(branch);
 if(!pr){const remote=await run('git',['ls-remote','origin',`refs/heads/${branch}`],worktree);if(remote&&!remote.startsWith(head+'\t'))throw Error('Remote branch collision');await github.push(worktree,head!,branch);pr=await github.findPR(branch);if(!pr)pr=await github.request<Pull>('pulls','POST',{title:`Publish article: ${prepared.metadata.title}`,head:branch,base:'main',draft:prOnly,body:`ADR-0044 exact-version ${prOnly?'PR preparation only; NO MERGE OR DEPLOYMENT AUTHORIZED':'publication owner approval'}. Job ${id}. Version SHA256 ${prepared.versionHash}. Scope: ${prepared.destination}. No editorial rewrite.`});}
 if(pr.head.sha!==head)throw Error('Unexpected remote PR head');
 const changed=await github.request<Array<{filename:string;status:string}>>(`pulls/${pr.number}/files?per_page=100`);
 if(changed.length!==1||changed[0].filename!==prepared.destination||changed[0].status!=='added')throw Error('Unexpected PR diff');
 await this.store.transition(id,{pr:{number:pr.number,url:pr.html_url},stage:job.website?'Website Verified':job.deployment?'Deployed':'Publishing',waiting:null,failedStep:null});
 if(prOnly){await this.store.transition(id,{waiting:'TEST PR ONLY — owner merge/publication authorization required',nextObservationAt:null,publicationAuthorized:false});return;}
 step='protected-merge';pr=await github.protectedMerge(pr.number,head!);
 if(!pr.merged||!pr.merge_commit_sha)throw new Waiting('Protected merge pending');
 await this.store.transition(id,{mergeCommit:pr.merge_commit_sha});
 step='deployment';const deployment=await github.production(pr.merge_commit_sha);
 await this.store.transition(id,{stage:'Deployed',deployment});
 step='website-verification';
 await run('git',['fetch','origin','main'],this.repo);
 if(await run('git',['merge-base','--is-ancestor',pr.merge_commit_sha,'origin/main'],this.repo)!=='')throw Error('Merge no longer on main');
 if(await run('git',['rev-parse',`origin/main:${prepared.destination}`],this.repo)!==await run('git',['hash-object','--stdin'],this.repo,output))throw Error('Newer main changed approved article');
 const website=await verifyWebsite({url:prepared.url,title:prepared.metadata.title,body:prepared.body});
 await this.store.transition(id,{stage:'Website Verified',website});
 step='archive';if(!this.vault)throw new Waiting('WEBSITE PUBLISHED / OBSIDIAN ARCHIVE INCOMPLETE: configure existing vault');
 const archive=await archiveArticle(this.vault,dir,{id,body:prepared.body,metadata:{...prepared.metadata,published_at:prepared.metadata.published_at!},url:prepared.url,destination:prepared.destination,commit:pr.merge_commit_sha,publicationAt:deployment.completedAt},await github.commitIdentity());
 await this.store.transition(id,{stage:'Archived',archive,waiting:archive.vaultMerge==='waiting owner approval'?'Archive branch verified; Vault main integration requires owner approval':null,failedStep:null,publicationStatus:'WEBSITE PUBLISHED / OBSIDIAN ARCHIVE BRANCH VERIFIED'});
 }catch(e) {
 const job=await this.store.get(id);await fs.appendFile(path.join(dir,'worker-private.log'),`${new Date().toISOString()} ${step}: ${String(e)}\n`,{mode:0o600});
 const message=e instanceof Waiting?e.message:`${step} failed; see private diagnostics`;
 await this.store.transition(id,{stage:e instanceof Waiting?job.stage:'Failed',failedStep:e instanceof Waiting?null:step,waiting:message,publicationStatus:job.website?'WEBSITE PUBLISHED / OBSIDIAN ARCHIVE INCOMPLETE':undefined,nextObservationAt:e instanceof Waiting&&/checks pending|protection\/review requirements pending|Matching main deployment/.test(message)?new Date(Date.now()+30000).toISOString():null});
 }
 }
}
