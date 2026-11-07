import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {dataRoot} from './credentials';import {run} from './process';import {Store,safePath} from './store';
export async function nativeHelper() {
 if(process.platform!=='darwin')throw Error('macOS Keychain authorization requires macOS');
 const store=await Store.open(dataRoot());const source=fileURLToPath(new URL('./keychain-auth.swift',import.meta.url));const binary=await safePath(store.root,'keychain-auth');
 const sourceStat=await fs.stat(source);let compile=true;try{compile=(await fs.stat(binary)).mtimeMs<sourceStat.mtimeMs;}catch{}
 if(compile){const cache=await safePath(store.root,'swift-module-cache');await fs.mkdir(cache,{recursive:true,mode:0o700});await run('/usr/bin/xcrun',['swiftc','-module-cache-path',cache,source,'-o',binary],path.dirname(source),undefined,180000);await fs.chmod(binary,0o700);}
 return binary;
}
export async function keychainToken() {
 const helper=await nativeHelper();
 // Never route secret stdout through diagnostic-bearing run(). Failure discards both streams.
 const {spawn}=await import('node:child_process');
 return new Promise<string|undefined>((resolve,reject)=>{
 const child=spawn(helper,['read'],{stdio:['ignore','pipe','ignore']});let bytes='';
 const timer=setTimeout(()=>{child.kill();reject(Error('Keychain access timed out'));},30000);
 child.stdout.on('data',b=>{bytes+=b;if(bytes.length>2048)child.kill();});child.on('error',()=>{clearTimeout(timer);reject(Error('Keychain helper unavailable'));});child.on('close',code=>{clearTimeout(timer);if(code===4)resolve(undefined);else if(code!==0)reject(Error('Keychain access denied'));else resolve(bytes);});
 });
}
export async function resolveCodexBinary() {
 if(process.env.STUDIO_CODEX_BIN)return process.env.STUDIO_CODEX_BIN;
 for(const file of ['/Applications/ChatGPT.app/Contents/Resources/codex-cli/CodexCLI.app/Contents/MacOS/codex','/Applications/Codex.app/Contents/Resources/codex']){try{await fs.access(file);return file;}catch{}}
 return 'codex';
}
