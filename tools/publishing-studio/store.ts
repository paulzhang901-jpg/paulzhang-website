import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash, randomUUID} from 'node:crypto';
export const MAX_UPLOAD=1024*1024;
export const digest=(data: string|Buffer)=>createHash('sha256').update(data).digest('hex');
export function decodeUpload(name:string, bytes:Buffer) {
 if (!name || /[/\\\x00-\x1f]/.test(name) || !name.endsWith('.md') || bytes.length>MAX_UPLOAD || !bytes.length) throw Error('Only bounded UTF-8 .md files (1 MiB) accepted');
 const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
 if (text.includes('\0')) throw Error('NUL forbidden');
 return text;
}
export async function safePath(root:string, relative='') {
 const base=path.resolve(root); const target=path.resolve(base,relative);
 if(target!==base&&!target.startsWith(base+path.sep)) throw Error('path escape');
 let current=path.parse(target).root;
 for(const part of target.slice(current.length).split(path.sep).filter(Boolean)) {
  current=path.join(current,part);
  try {if((await fs.lstat(current)).isSymbolicLink()) throw Error('symlink forbidden');}
  catch(e) {if((e as NodeJS.ErrnoException).code!=='ENOENT') throw e;}
 }
 return target;
}
export type Job={id:string;name:string;uploadHash:string;stage:string;at:string;[key:string]:unknown};
export class Store {
 constructor(public root:string){}
 static async open(root:string) {await safePath(root);await fs.mkdir(root,{recursive:true,mode:0o700});if((await fs.stat(root)).mode&0o077)throw Error("Data directory must already be private (0700); permissions are never changed automatically");return new Store(root);}
 async dir(id:string) {if(!/^[0-9a-f-]{36}$/.test(id)) throw Error('invalid job');return safePath(this.root,id);}
 async upload(name:string,bytes:Buffer) {
  decodeUpload(name,bytes); const id=randomUUID(),dir=await this.dir(id);await fs.mkdir(dir,{mode:0o700});
  await this.exclusive(path.join(dir,'upload.md'),bytes);
  const job={id,name,uploadHash:digest(bytes),stage:'Uploaded',at:new Date().toISOString()};await this.record(job);return job;
 }
 async exclusive(file:string,data:string|Buffer) {await safePath(this.root,path.relative(this.root,file));const h=await fs.open(file,'wx',0o600);try{await h.writeFile(data);await h.sync();}finally{await h.close();}}
 async record(job:Job) {
  const file=path.join(await this.dir(job.id),'events.jsonl');await safePath(this.root,path.relative(this.root,file));
  const h=await fs.open(file,'a',0o600);try{await h.writeFile(JSON.stringify({...job,at:new Date().toISOString()})+'\n');await h.sync();}finally{await h.close();}return job;
 }
 async get(id:string):Promise<Job> {const raw=await fs.readFile(path.join(await this.dir(id),'events.jsonl'),'utf8');const lines=raw.trim().split('\n');return JSON.parse(lines.at(-1)!);}
 async bytes(id:string) {const job=await this.get(id);const file=await safePath(this.root,path.relative(this.root,path.join(await this.dir(id),'upload.md')));const bytes=await fs.readFile(file);if(digest(bytes)!==job.uploadHash)throw Error('upload hash changed');return bytes;}
 async list() {const names=await fs.readdir(this.root);const jobs=[];for(const id of names.filter(n=>/^[0-9a-f-]{36}$/.test(n)))jobs.push(await this.get(id));return jobs;}
 async transition(id:string,patch:Record<string,unknown>) {const job=await this.get(id);return this.record({...job,...patch});}
}
