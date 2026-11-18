import fs from 'node:fs/promises';import {constants} from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {safePath} from './store';
export const dataRoot=()=>process.env.STUDIO_DATA||fileURLToPath(new URL('../../../Publishing Studio Local Data',import.meta.url));
export async function readTokenFile(file:string) {
 await safePath(path.dirname(file),path.basename(file));
 const handle=await fs.open(file,constants.O_RDONLY|constants.O_NOFOLLOW);
 try {
 const stat=await handle.stat();
 if(!stat.isFile()||(stat.mode&0o077)||stat.nlink!==1||(process.getuid&&stat.uid!==process.getuid()))throw Error('GitHub token file must be owned by this user, regular, single-linked and mode 0600');
 if(stat.size>1024)throw Error('Invalid token file');
 const token=(await handle.readFile('utf8')).trim();if(!token||/\s/.test(token))throw Error('Invalid token file');return token;
 }finally{await handle.close();}
}
export function gitAuthEnvironment(token:string,base:NodeJS.ProcessEnv=process.env):NodeJS.ProcessEnv {
 const env:NodeJS.ProcessEnv={NODE_ENV:base.NODE_ENV||'production'};
 for(const [key,value] of Object.entries(base))if(!key.startsWith('GIT_')&&!['GH_TOKEN','GITHUB_TOKEN','STUDIO_GITHUB_TOKEN'].includes(key))env[key]=value;
 env.GIT_TERMINAL_PROMPT='0';env.GIT_CONFIG_COUNT='1';env.GIT_CONFIG_KEY_0='http.https://github.com/.extraheader';env.GIT_CONFIG_VALUE_0='AUTHORIZATION: basic '+Buffer.from('x-access-token:'+token).toString('base64');return env;
}
