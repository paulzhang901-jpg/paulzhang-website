import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {readTokenFile,gitAuthEnvironment} from '../../tools/publishing-studio/credentials';
test('private token file is read without disclosing or accepting unsafe files',async()=>{
 const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-auth-'))),file=path.join(root,'github-token');
 try{await fs.writeFile(file,'test-credential\n',{mode:0o600});assert.equal(await readTokenFile(file),'test-credential');await fs.chmod(file,0o644);await assert.rejects(()=>readTokenFile(file),/0600/);await fs.chmod(file,0o600);await fs.symlink(file,path.join(root,'link'));await assert.rejects(()=>readTokenFile(path.join(root,'link')),/symlink/);}finally{await fs.rm(root,{recursive:true,force:true});}
});
test('Git push uses same credential via process-only config; trace and prompts disabled',()=>{
 const env=gitAuthEnvironment('test-credential',{PATH:'/bin',NODE_ENV:'test',GIT_TRACE_CURL:'1',GIT_CONFIG_COUNT:'9',GIT_CONFIG_VALUE_8:'hostile'});
 assert.equal(env.GIT_TERMINAL_PROMPT,'0');assert.equal(env.GIT_TRACE_CURL,undefined);assert.equal(env.GIT_CONFIG_VALUE_8,undefined);assert.equal(env.GIT_CONFIG_COUNT,'1');assert.equal(env.GIT_CONFIG_KEY_0,'http.https://github.com/.extraheader');assert.match(env.GIT_CONFIG_VALUE_0!,/^AUTHORIZATION: basic /);
});
