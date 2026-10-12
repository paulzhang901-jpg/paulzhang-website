import {join} from 'node:path';
import {IdentityVerifier} from '../../src/lib/narration-governance/identity';
import {LocalPrivateObjects} from '../../src/lib/narration-governance/adapters';
import {NarrationGovernance} from '../../src/lib/narration-governance/service';
import {SqliteGovernanceStore} from '../../src/lib/narration-governance/store';
const [root,id,key,token,request,action='claim',clock='100000']=process.argv.slice(2);
const store=new SqliteGovernanceStore(join(root,'state.sqlite'));
const job=store.snapshot().jobs[id];
const auth=new IdentityVerifier('test-issuer','admin',new Map([['key1',key]]),{sessionActive:()=>true,roles:()=>['Generator']},()=>Number(clock));
const service=new NarrationGovernance(store,auth,{current:()=>job.source},{current:()=>job.voice},new LocalPrivateObjects(join(root,'objects')),()=>Number(clock));
try {
  if(action==='audit-traffic') {
    const actor=auth.authenticate(token);process.stdout.write('ready\n');
    for(let i=0;i<30;i++) {
      service.reconcile(actor,request+'-'+i,id);
      await new Promise(resolve=>setTimeout(resolve,2));
    }
  } else if(action==='reconcile') service.reconcile(auth.authenticate(token),request,id);
  else {
    service.claim(auth.authenticate(token),request,id);
    if(action==='claim-and-wait') {process.stdout.write('claimed\n');setInterval(()=>{},1000);}
  }
} catch {process.exitCode=2;} finally {store.close();}
