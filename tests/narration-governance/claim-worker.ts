import {join} from 'node:path';
import {IdentityVerifier} from '../../src/lib/narration-governance/identity';
import {LocalPrivateObjects} from '../../src/lib/narration-governance/adapters';
import {NarrationGovernance} from '../../src/lib/narration-governance/service';
import {SqliteGovernanceStore} from '../../src/lib/narration-governance/store';
const [root,id,key,token,request]=process.argv.slice(2);
const store=new SqliteGovernanceStore(join(root,'state.sqlite'));
const job=store.snapshot().jobs[id];
const auth=new IdentityVerifier('test-issuer','admin',new Map([['key1',key]]),{sessionActive:()=>true,roles:()=>['Generator']},()=>100000);
const service=new NarrationGovernance(store,auth,{current:()=>job.source},{current:()=>job.voice},new LocalPrivateObjects(join(root,'objects')),()=>100000);
try {service.claim(auth.authenticate(token),request,id);} catch {process.exitCode=2;} finally {store.close();}
