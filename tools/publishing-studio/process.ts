import {spawn} from 'node:child_process';
export async function run(file:string,args:string[],cwd:string,input?:string,timeout=120000,environment:NodeJS.ProcessEnv=process.env):Promise<string> {
 return new Promise((resolve,reject)=>{
 const child=spawn(file,args,{cwd,env:{...environment,GIT_TERMINAL_PROMPT:'0'},stdio:['pipe','pipe','pipe']});let out='',err='';let overflow=false;
 const timer=setTimeout(()=>child.kill('SIGTERM'),timeout);
 child.stdout.on('data',b=>{out+=b;if(out.length>8*1024*1024){overflow=true;child.kill();}});
 child.stderr.on('data',b=>{err=(err+b).slice(-32768);});
 child.on('error',e=>{clearTimeout(timer);reject(e);});
 child.on('close',code=>{clearTimeout(timer);if(code!==0||overflow)reject(Error(`${file} exited ${code}: ${err.slice(-4000)} ${out.slice(-2000)}`));else resolve(out.trim());});
 child.stdin.end(input);
 });
}
