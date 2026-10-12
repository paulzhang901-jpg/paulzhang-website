import {constants,lstatSync,openSync,closeSync,readFileSync,writeFileSync,fsyncSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {digest,GovernanceError,SourceSchema,type SourceAuthority,type SourceRef,type PrivateObjects} from './contracts';

/** Owner-only directory outside static/public paths. No URLs or public promotion method. */
export class LocalPrivateObjects implements PrivateObjects {
  private root:string;
  constructor(root:string) {
    this.root=resolve(root);const stat=lstatSync(this.root);
    if(!stat.isDirectory() || stat.isSymbolicLink() || stat.mode&0o077 || (process.getuid && stat.uid!==process.getuid())) throw new GovernanceError('DENIED');
  }
  private path(key:string) {if(!/^[a-f0-9]{64}$/.test(key)) throw new GovernanceError('INVALID');return join(this.root,key);}
  read(key:string) {
    const file=this.path(key);const stat=lstatSync(file);
    if(!stat.isFile() || stat.isSymbolicLink() || stat.mode&0o077) throw new GovernanceError('DENIED');
    const fd=openSync(file,constants.O_RDONLY|constants.O_NOFOLLOW);
    try {const bytes=readFileSync(fd);if(digest(bytes)!==key) throw new GovernanceError('INTEGRITY');return bytes;} finally {closeSync(fd);}
  }
  putExclusive(key:string,bytes:Uint8Array) {
    if(digest(bytes)!==key) throw new GovernanceError('INTEGRITY');
    let fd:number;
    try {fd=openSync(this.path(key),'wx',0o600);} catch(error) {
      if((error as NodeJS.ErrnoException).code!=='EEXIST') throw error;
      this.read(key);return;
    }
    try {writeFileSync(fd,bytes);fsyncSync(fd);} finally {closeSync(fd);}
  }
}
const require=createRequire(import.meta.url);
const {extractNarration}=require('../media-publishing/core.mjs') as {extractNarration:(mdx:string)=>{canonical_id:string;language:string;article_content_hash:string}};
/** Canonical paths are provisioned server-side. Reconcile freshly fetched approved main, never caller snapshots. */
export class GitPublishedSource implements SourceAuthority {
  constructor(private root:string,private paths:ReadonlyMap<string,string>) {}
  current(id:string,locale:SourceRef['locale']):SourceRef {
    const file=this.paths.get(id+':'+locale);
    if(!file || !/^content\/(zh-CN|en-US)\/[a-zA-Z0-9_/-]+\.mdx$/.test(file) || file.includes('..')) throw new GovernanceError('INVALID');
    const git=(args:string[])=>execFileSync('git',args,{cwd:this.root,encoding:'utf8',timeout:15000,maxBuffer:2_000_000,stdio:['ignore','pipe','pipe'],env:{...process.env,GIT_TERMINAL_PROMPT:'0'}}).trim();
    if(git(['remote','get-url','origin'])!=='https://github.com/paulzhang901-jpg/paulzhang-website.git') throw new GovernanceError('DENIED');
    git(['fetch','origin','main']);const commit=git(['rev-parse','origin/main']);
    const article=extractNarration(git(['show',commit+':'+file]));
    if(article.canonical_id!==id || article.language!==locale) throw new GovernanceError('INTEGRITY');
    return SourceSchema.parse({canonical_id:id,locale,commit,parser_version:'phase6c/v1',source_sha256:article.article_content_hash});
  }
}
