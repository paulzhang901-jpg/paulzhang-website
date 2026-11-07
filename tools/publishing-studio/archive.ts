import fs from 'node:fs/promises';import path from 'node:path';
import {safePath,digest} from './store';import {run} from './process';import {splitSource} from './content';
type ArchiveInput={id:string;body:string;metadata:{title:string;canonical_id:string;slug:string;content_type:string;topics?:string[];summary?:string;published_at:string};url:string;destination:string;commit:string;publicationAt:string};
async function candidates(root:string,data:ArchiveInput) {
 const found:Array<{file:string;body:string;metadata:Record<string,unknown>}>=[];
 async function walk(dir:string) {
 for(const entry of await fs.readdir(dir,{withFileTypes:true})) {
 if(entry.name.startsWith('.'))continue;
 const file=await safePath(root,path.relative(root,path.join(dir,entry.name)));
 if(entry.isDirectory())await walk(file);
 else if(entry.name.endsWith('.md')) {
 const text=await fs.readFile(file,'utf8');
 if(![data.metadata.canonical_id,data.metadata.slug,data.metadata.title,data.url].some(v=>v&&text.includes(v)))continue;
 let parsed;try{parsed=splitSource(text);}catch{throw Error('archive conflict: matching note has malformed metadata');}
 const m=parsed.metadata;
 if(m.language&&m.language!=='zh-CN')continue;
 if(m.canonical_id===data.metadata.canonical_id||m.slug===data.metadata.slug||m.title===data.metadata.title||m.website_url===data.url)found.push({file,body:parsed.body,metadata:m});
 }
 }
 }
 await walk(root);return found;
}
export async function archiveArticle(vault:string,jobDir:string,data:ArchiveInput,identity?:{name:string;email:string}) {
 await safePath(vault);await fs.readFile(path.join(vault,'AGENTS.md'),'utf8');
 const articleRoot=await safePath(vault,'08 Writing/Articles');await fs.access(articleRoot);
 const duplicate=await candidates(vault,data);
 if(duplicate.length>1)throw Error('archive conflict: multiple matching records');
 if(duplicate.length) {
 const note=duplicate[0];if(note.body!==data.body)throw Error('archive body conflict');
 if(note.metadata.source_commit!==data.commit)throw Error('archive metadata conflict: safe metadata update needs review');
 return {bodyVerified:true,path:note.file,bodyHash:digest(data.body),commit:data.commit,noOp:true,vaultMerge:'not requested'};
 }
 const branch=`codex/studio-archive-${data.id}`,worktree=path.join(jobDir,'vault-worktree');
 const filename=`${data.metadata.published_at.slice(0,10)}_${data.metadata.slug}_ZH.md`,relative=`08 Writing/Articles/${filename}`;
 try {await fs.access(worktree);}catch{
  const base=await run('git',['rev-parse','HEAD'],vault);let existing:string|undefined;try{existing=await run('git',['rev-parse','--verify',`refs/heads/${branch}`],vault);}catch{/* A new task branch is expected. */}
  if(existing&&existing!==base)throw Error('Archive branch exists with unexpected history');
  await run('git',['worktree','add','--no-checkout',...(existing?[]:['-b',branch]),worktree,existing?branch:'HEAD'],vault);
  await run('git',['read-tree','HEAD'],worktree);
  await run('git',['sparse-checkout','set','--no-cone','--stdin'],worktree,`/${relative}\n`);
 }
 if(await run('git',['branch','--show-current'],worktree)!==branch)throw Error('archive branch mismatch');
 await fs.mkdir(await safePath(worktree,'08 Writing/Articles'),{recursive:true});
 const file=await safePath(worktree,relative);
 const meta={title:data.metadata.title,author:'Paul Zhang',date:data.metadata.published_at.slice(0,10),category:data.metadata.topics?.[0],tags:data.metadata.topics,summary:data.metadata.summary,language:'zh-CN',canonical_id:data.metadata.canonical_id,slug:data.metadata.slug,content_type:'article',status:'published',website_status:'published',source_file:data.destination,source_commit:data.commit,website_url:data.url,public_locale_urls:{'zh-CN':data.url},available_languages:['zh-CN'],publication_date:data.publicationAt};
 const output=`---\n${JSON.stringify(meta,null,2)}\n---\n${data.body}`;
 try {const existing=await fs.readFile(file,'utf8');if(existing!==output)throw Error('archive body conflict');}
 catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;const h=await fs.open(file,'wx',0o600);try{await h.writeFile(output);await h.sync();}finally{await h.close();}}
 const changes=await run('git',['status','--porcelain','--untracked-files=all'],worktree);
 if(changes) {
  const untracked=(await run('git',['ls-files','--others','--exclude-standard','-z'],worktree)).split('\0').filter(Boolean);
  const staged=(await run('git',['diff','--cached','--name-status','-z'],worktree)).split('\0').filter(Boolean);
  const exactStaged=staged.length===2&&staged[0]==='A'&&staged[1]===relative&&await run('git',['rev-parse',`:${relative}`],worktree)===await run('git',['hash-object','--stdin'],worktree,output);
  if(await run('git',['diff','--name-only'],worktree)||(staged.length&&!exactStaged)||(exactStaged?untracked.length!==0:untracked.length!==1||untracked[0]!==relative))throw Error('Unexpected vault diff');
  await run('git',['add','--',relative],worktree);await run('git',['-c','core.whitespace=cr-at-eol','diff','--cached','--check'],worktree);
  if(await run('git',['diff','--cached','--name-only','-z'],worktree)!==relative+'\0')throw Error('Unexpected staged vault diff');
  await run('git',[...(identity?['-c',`user.name=${identity.name}`,'-c',`user.email=${identity.email}`]:[]),'commit','-m',`Archive approved article ${data.metadata.canonical_id}`],worktree);
 }
 if(splitSource(await fs.readFile(file,'utf8')).body!==data.body)throw Error('archive body verification failed');
 return {bodyVerified:true,path:file,bodyHash:digest(data.body),commit:await run('git',['rev-parse','HEAD'],worktree),branch,vaultMerge:'waiting owner approval'};
}
