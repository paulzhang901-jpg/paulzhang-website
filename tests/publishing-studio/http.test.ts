import http from 'node:http';import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {startStudio} from '../../tools/publishing-studio/server';
test('actual loopback HTTP enforces host, session, origin, CSRF and writes upload bytes',async()=>{
 const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-http-')));
 const studio=await startStudio({root,port:0});
 try {
 const base=studio.origin;
 assert.equal((await fetch(base+'/api/jobs')).status,403);
 assert.equal(await new Promise(resolve=>{const req=http.get(base+'/',{headers:{host:'evil.example'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',()=>resolve(0));}),403);
 const auth=await fetch(base+'/session',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({key:studio.key})});
 assert.equal(auth.status,200);const cookie=auth.headers.get('set-cookie')!.split(';')[0];const {csrf}=await auth.json();
 assert.equal((await fetch(base+'/api/upload?name=a.md',{method:'POST',headers:{cookie,origin:'https://evil.example','x-csrf-token':csrf},body:'中文'})).status,403);
 assert.equal((await fetch(base+'/api/upload?name=a.md',{method:'POST',headers:{cookie,origin:base},body:'中文'})).status,403);
 const response=await fetch(base+'/api/upload?name=a.md',{method:'POST',headers:{cookie,origin:base,'x-csrf-token':csrf},body:'# 中文\r\n'});
 assert.equal(response.status,200);const job=await response.json();assert.equal(await fs.readFile(path.join(root,job.id,'upload.md'),'utf8'),'# 中文\r\n');
 assert.equal((await fetch(base+'/api/jobs',{headers:{cookie}})).status,200);
 }finally{await studio.close();await fs.rm(root,{recursive:true,force:true});}
});
test('GitHub readiness is authenticated and returns a concrete missing-credential action',async()=>{
 const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-github-http-')));
 const studio=await startStudio({root,port:0});
 try {
 const base=studio.origin;assert.equal((await fetch(base+'/api/github-check',{method:'POST',headers:{origin:base},body:'{}'})).status,403);
 const auth=await fetch(base+'/session',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({key:studio.key})});const cookie=auth.headers.get('set-cookie')!.split(';')[0];const {csrf}=await auth.json();
 // Existing environment is not used: no live credential or network access in this integration test.
 const res=await fetch(base+'/api/status',{headers:{cookie}});const status=await res.json();assert.equal(status.github.authenticated,false);assert.match(status.github.reason,/Not tested/);
 assert.equal((await fetch(base+'/api/github-check',{method:'POST',headers:{cookie,origin:base,'x-csrf-token':'invalid'},body:'{}'})).status,403);
 assert.ok(csrf);
 }finally{await studio.close();await fs.rm(root,{recursive:true,force:true});}
});
