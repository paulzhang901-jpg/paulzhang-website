import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
import {prepare} from '../../tools/publishing-studio/content';
const source=await fs.readFile('content/zh-CN/library/can-christians-celebrate-halloween.md','utf8');
const fresh=source.replaceAll('article-can-christians-celebrate-halloween-2026-10-27','studio-new-article').replaceAll('can-christians-celebrate-halloween','studio-new-slug');
test('reuses canonical validators and preserves exact body bytes',()=>{
 const result=prepare(fresh,{domain:'library'});assert.equal(result.body,fresh.slice(fresh.indexOf('\n---\n')+5));assert.equal(result.destination,'content/zh-CN/library/studio-new-slug.md');assert.match(result.url,/paulzhang.org\/library\/studio-new-slug$/);
});
test('duplicates, private publication, malformed YAML and executable MDX stop',()=>{
 assert.throws(()=>prepare(source,{domain:'library'}),/collision/);
 assert.throws(()=>prepare(fresh.replace('visibility: "public"','visibility: "private"'),{domain:'library'}));
 assert.throws(()=>prepare('---\na: [\n---\nbody',{domain:'library'}));
 assert.throws(()=>prepare(fresh+'\n{process.exit()}\n',{domain:'library'}));
 assert.throws(()=>prepare(fresh+'\n<script>alert(1)</script>',{domain:'library'}));
 assert.throws(()=>prepare(fresh,{domain:'../../public'}));
});
test('plain finalized body can receive explicit metadata without rewriting',()=>{
 const result=prepare('中文原稿。\r\n',{domain:'library',metadata:{id:'studio-test-zh',canonical_id:'studio-test',slug:'studio-test',title:'原稿',summary:'摘要',content_type:'article',language:'zh-CN',topics:['theology'],status:'published',published_at:'2026-10-31T00:00:00Z',visibility:'public',access_level:'public'}});
 assert.equal(result.body,'中文原稿。\r\n'); assert.ok(result.output.endsWith(result.body));
});
test('resume accepts only the exact already-committed job output after main sync',async()=>{
 const os=await import('node:os');const path=await import('node:path');const {digest}=await import('../../tools/publishing-studio/store');const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-resume-')));
 try{await fs.cp('content',path.join(root,'content'),{recursive:true});const first=prepare(fresh,{domain:'library'},root);const destination=path.join(root,first.destination);await fs.writeFile(destination,first.output);assert.throws(()=>prepare(fresh,{domain:'library'},root),/collision/);const resumed=prepare(fresh,{domain:'library'},root,{destination:first.destination,outputHash:digest(first.output)});assert.equal(resumed.versionHash,first.versionHash);await fs.appendFile(destination,'\nchanged');assert.throws(()=>prepare(fresh,{domain:'library'},root,{destination:first.destination,outputHash:digest(first.output)}),/collision/);}
 finally{await fs.rm(root,{recursive:true,force:true});}
});
