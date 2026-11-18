import os from 'node:os';import path from 'node:path';import fs from 'node:fs/promises';
import {startStudio} from './server';import {dataRoot} from './credentials';
let vault=process.env.STUDIO_VAULT;
if(!vault){try{const config=JSON.parse(await fs.readFile(path.join(os.homedir(),'Library/Application Support/obsidian/obsidian.json'),'utf8'));const values=Object.values(config.vaults) as Array<{path:string;open:boolean}>;vault=values.find(v=>v.open&&v.path.endsWith('/Paul AI Brain'))?.path;}catch{/* Explicitly unconfigured. */}}
const root=dataRoot();
const studio=await startStudio({root,vault,port:Number(process.env.STUDIO_PORT||4318)});
console.log(`Publishing Studio: ${studio.origin}/#${studio.key}\nPrivate data: ${root}\nVault: ${vault||'not configured'}\nUpload alone never publishes. Keep this terminal running.`);
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>{void studio.close().then(()=>process.exit(0)).catch(e=>console.error(e.message));});
