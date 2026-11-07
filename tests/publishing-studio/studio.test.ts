import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Store, decodeUpload, digest} from '../../tools/publishing-studio/store';

test('bounded UTF-8 Markdown rejects traversal, non UTF-8 and oversized uploads',()=>{
  assert.throws(()=>decodeUpload('../a.md',Buffer.from('中文')));
  assert.throws(()=>decodeUpload('a.mdx',Buffer.from('中文')));
  assert.throws(()=>decodeUpload('a.md',Buffer.from([255])));
  assert.throws(()=>decodeUpload('a.md',Buffer.alloc(1048577)));
  assert.equal(decodeUpload('中文.md',Buffer.from('中文')),'中文');
});
test('real disk upload is exclusive, private, durable and detects tampering',async()=>{
  const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-test-')));
  try {
    const store=await Store.open(root); const bytes=Buffer.from('# 定稿\r\n\r\n原文。\r\n');
    const job=await store.upload('文章.md',bytes);
    assert.equal((await store.bytes(job.id)).compare(bytes),0);
    assert.equal(job.uploadHash,digest(bytes));
    assert.equal((await new Store(root).get(job.id)).stage,'Uploaded');
    assert.equal((await fs.stat(path.join(root,job.id,'upload.md'))).mode&0o777,0o600);
    await fs.writeFile(path.join(root,job.id,'upload.md'),'changed');
    await assert.rejects(()=>store.bytes(job.id),/hash/);
    await assert.rejects(()=>store.get('../oops'));
  } finally {await fs.rm(root,{recursive:true,force:true});}
});
test('symlink roots are rejected',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'studio-link-'));
 try {await fs.symlink(root,path.join(root,'link')); await assert.rejects(()=>Store.open(path.join(root,'link')),/symlink/);}
 finally {await fs.rm(root,{recursive:true,force:true});}
});
test('symlink upload replacement cannot escape private storage',async()=>{
 const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-escape-')));
 try {const store=await Store.open(root);const job=await store.upload('a.md',Buffer.from('原稿'));await fs.rename(path.join(root,job.id,'upload.md'),path.join(root,'original.md'));await fs.symlink(path.join(root,'original.md'),path.join(root,job.id,'upload.md'));await assert.rejects(()=>store.bytes(job.id),/symlink/);}
 finally{await fs.rm(root,{recursive:true,force:true});}
});
test('pre-existing public data directory is rejected without changing permissions',async()=>{
 const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'studio-perms-')));
 try{await fs.chmod(root,0o755);await assert.rejects(()=>Store.open(root),/private/);assert.equal((await fs.stat(root)).mode&0o777,0o755);}finally{await fs.rm(root,{recursive:true,force:true});}
});
