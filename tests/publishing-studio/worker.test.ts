import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {verifyWebsite, approvalMatches} from '../../tools/publishing-studio/worker';
import {archiveArticle} from '../../tools/publishing-studio/archive';
import {Store} from '../../tools/publishing-studio/store';
import {run} from '../../tools/publishing-studio/process';
test('approval binds exact version and cannot be reused after edits',()=>{
 assert.equal(approvalMatches({versionHash:'a',intent:'publish'},'a'),true);
 assert.equal(approvalMatches({versionHash:'a',intent:'publish'},'b'),false);
 assert.equal(approvalMatches(undefined,'a'),false);
});
test('public verifier rejects redirects, soft 404 and wrong canonical',async()=>{
 const expected={url:'https://paulzhang.org/library/test',title:'中文文章',body:'准确的中文正文。'};
 await assert.rejects(()=>verifyWebsite(expected,async()=>new Response('Not found',{status:200})),/verification/);
 await assert.rejects(()=>verifyWebsite(expected,async()=>new Response('',{status:302,headers:{location:'/'}})),/verification/);
 await assert.rejects(()=>verifyWebsite(expected,async()=>new Response('<title>中文文章</title><link rel="canonical" href="https://paulzhang.org/library/other">准确的中文正文。')),/verification/);
});
test('archive uses dedicated vault branch, preserves original checkout and exact bytes; retry no-op',async()=>{
 const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-archive-')));
 try {
 const vault=path.join(root,'vault');await fs.mkdir(vault);await run('git',['init','-b','main'],vault);await run('git',['config','user.email','test@example.com'],vault);await run('git',['config','user.name','test'],vault);
 await fs.mkdir(path.join(vault,'08 Writing/Articles'),{recursive:true});await fs.writeFile(path.join(vault,'AGENTS.md'),'Use dedicated task branches. Never merge main.');await fs.writeFile(path.join(vault,'08 Writing/Articles/example.md'),'---\n{"title":"旧文章","canonical_id":"old","slug":"old","language":"zh-CN","source_commit":"a","website_url":"https://paulzhang.org/library/old"}\n---\n旧原文。');await run('git',['add','.'],vault);await run('git',['commit','-m','init'],vault);
 const store=await Store.open(path.join(root,'jobs'));const job=await store.upload('a.md',Buffer.from('中文正文。\r\n'));
 const data={id:job.id,body:'中文正文。\r\n',metadata:{title:'测试',canonical_id:'test',slug:'test',content_type:'article',topics:['theology'],published_at:'2026-10-31T00:00:00Z'},url:'https://paulzhang.org/library/test',destination:'content/zh-CN/library/test.md',commit:'a'.repeat(40),publicationAt:'2026-10-31T00:00:00Z'};
 const evidence=await archiveArticle(vault,await store.dir(job.id),data);
 assert.equal(evidence.bodyVerified,true);assert.equal(await run('git',['branch','--show-current'],vault),'main');assert.equal(await run('git',['status','--porcelain'],vault),'');
 const again=await archiveArticle(vault,await store.dir(job.id),data);assert.equal(again.commit,evidence.commit);
 await assert.rejects(async()=>archiveArticle(vault,await store.dir(job.id),{...data,body:'冲突'}),/conflict/);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
test('missing credentials stop before Codex, Git changes or fabricated success and survive restart',async()=>{
 const {Worker}=await import('../../tools/publishing-studio/worker');const {prepare}=await import('../../tools/publishing-studio/content');
 const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-worker-auth-')));
 const previous={GH_TOKEN:process.env.GH_TOKEN,GITHUB_TOKEN:process.env.GITHUB_TOKEN,STUDIO_GITHUB_TOKEN_FILE:process.env.STUDIO_GITHUB_TOKEN_FILE,STUDIO_CODEX_BIN:process.env.STUDIO_CODEX_BIN};
 try{
 delete process.env.GH_TOKEN;delete process.env.GITHUB_TOKEN;process.env.STUDIO_CODEX_BIN='/nonexistent-studio-codex';
 const unsafe=path.join(root,'unsafe-token');await fs.writeFile(unsafe,'test-no-secret',{mode:0o644});process.env.STUDIO_GITHUB_TOKEN_FILE=unsafe;
 const source='中文定稿，不发布。\n';const proposal={domain:'library',metadata:{id:'studio-auth-test-zh',canonical_id:'studio-auth-test',slug:'studio-auth-test',title:'本机权限验收',summary:'本机权限验收',content_type:'article',language:'zh-CN',topics:['theology'],status:'published',published_at:'2026-10-31T00:00:00Z',visibility:'public',access_level:'public'}};
 const store=await Store.open(path.join(root,'jobs'));const job=await store.upload('article.md',Buffer.from(source));const prepared=prepare(source,proposal);await store.exclusive(path.join(await store.dir(job.id),'approved.md'),prepared.output);
 await store.transition(job.id,{proposal,approval:{versionHash:prepared.versionHash,intent:'publish'},stage:'Publishing'});
 const {Waiting}=await import('../../tools/publishing-studio/github');await new Worker(store,process.cwd(),undefined,async()=>{throw new Waiting('GitHub credentials unavailable');}).resume(job.id);
 const after=await new Store(store.root).get(job.id);assert.equal(after.stage,'Publishing');assert.match(String(after.waiting),/credentials/);assert.equal(after.executor,undefined);assert.equal(after.pr,undefined);assert.equal(after.nextObservationAt,null);
 await assert.rejects(async()=>fs.access(path.join(await store.dir(job.id),'executor')));
 }finally{for(const [key,value] of Object.entries(previous))if(value===undefined)delete process.env[key];else process.env[key]=value;await fs.rm(root,{recursive:true,force:true});}
});
test('PR-only authorization never grants publication or protected merge',()=>{
 assert.equal(approvalMatches({versionHash:'a',intent:'prepare-pr'},'a'),false);
 assert.equal(approvalMatches({versionHash:'a',intent:'prepare-pr'},'a','prepare-pr'),true);
 assert.equal(approvalMatches({versionHash:'a',intent:'publish'},'a','prepare-pr'),false);
});
test('website verification handles rendered lists, quotes and short Markdown text',async()=>{
 const expected={url:'https://paulzhang.org/library/test',title:'中文文章',body:'# 中文文章\n\n1. 有序列表中的中文正文应当正常验证。\n\n> 引用文字也需要真正进行核对。\n\n- 短句。'};
 const html='<link rel="canonical" href="https://paulzhang.org/library/test"><article><h1>中文文章</h1><ol><li>有序列表中的中文正文应当正常验证。</li></ol><blockquote><p>引用文字也需要真正进行核对。</p></blockquote><ul><li>短句。</li></ul></article>';
 assert.ok(await verifyWebsite(expected,async()=>new Response(html)));
 await assert.rejects(()=>verifyWebsite(expected,async()=>new Response(html.replace('引用文字也需要真正进行核对。','缺少批准的引用。'))),/verification/);
});
test('archive recovers exact staged addition after commit failure',async()=>{
 const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-staged-')));
 try{const vault=path.join(root,'vault');await fs.mkdir(vault);await run('git',['init','-b','main'],vault);await run('git',['config','user.name','Test'],vault);await run('git',['config','user.email','test@example.com'],vault);await fs.mkdir(path.join(vault,'08 Writing/Articles'),{recursive:true});await fs.writeFile(path.join(vault,'AGENTS.md'),'Use task branches.');await run('git',['add','.'],vault);await run('git',['commit','-m','init'],vault);const hooks=path.join(root,'hooks');await fs.mkdir(hooks);const hook=path.join(hooks,'pre-commit');await fs.writeFile(hook,'#!/bin/sh\nexit 1\n',{mode:0o700});await run('git',['config','core.hooksPath',hooks],vault);const jobDir=path.join(root,'job');await fs.mkdir(jobDir);const data={id:'staged-test',body:'精确原文。\n',metadata:{title:'暂存恢复',canonical_id:'staged-test',slug:'staged-test',content_type:'article',published_at:'2026-11-01T00:00:00Z'},url:'https://paulzhang.org/library/staged-test',destination:'content/zh-CN/library/staged-test.md',commit:'a'.repeat(40),publicationAt:'2026-11-01T00:00:00Z'};await assert.rejects(()=>archiveArticle(vault,jobDir,data));await fs.unlink(hook);const evidence=await archiveArticle(vault,jobDir,data);assert.equal(evidence.bodyVerified,true);assert.equal(await run('git',['status','--porcelain'],path.join(jobDir,'vault-worktree')),'');}
 finally{await fs.rm(root,{recursive:true,force:true});}
});
