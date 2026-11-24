// Owner-invoked acceptance entry: never grants publication or vault-write authorization.
import fs from 'node:fs/promises';import path from 'node:path';import {Store} from './store';import {dataRoot} from './credentials';import {prepare,type Proposal} from './content';import {Worker} from './worker';
const id=process.argv[2];if(!id)throw Error('Provide the existing validated test upload job ID');
const store=await Store.open(dataRoot());const job=await store.get(id);
if(job.approval)throw Error('A publication-approved job cannot be repurposed as a PR-only test');
const source=(await store.bytes(id)).toString();const prepared=prepare(source,job.proposal as Proposal);
if(!prepared.metadata.slug.startsWith('publishing-studio-acceptance-'))throw Error('This entry accepts only explicit Publishing Studio test articles');
if(!job.preparationApproval){if(job.stage!=='Validated')throw Error('Validate through Studio first');await store.exclusive(path.join(await store.dir(id),'approved.md'),prepared.output);await store.transition(id,{preparationOnly:true,preparationApproval:{versionHash:prepared.versionHash,intent:'prepare-pr',at:new Date().toISOString(),ownerAction:'Explicit owner request: create test branch and draft PR only'},publicationAuthorized:false,stage:'Publishing',waiting:null});}
const lock=path.join(store.root,'pr-acceptance.lock');await store.exclusive(lock,id);
try{await new Worker(store,process.cwd()).resume(id);const result=await store.get(id);console.log(JSON.stringify({id:result.id,stage:result.stage,pr:result.pr,head:result.head,lastPassedGate:result.lastPassedGate,waiting:result.waiting,failedStep:result.failedStep,publicationAuthorized:false}));}
finally{await fs.unlink(lock);}
