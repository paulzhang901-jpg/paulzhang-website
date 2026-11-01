import {test} from 'node:test';import assert from 'node:assert/strict';import {GitHub,Waiting} from '../../tools/publishing-studio/github';
class FixtureGitHub extends GitHub {
 calls:string[]=[];
 constructor(private responses:Record<string,unknown>){super('test-not-a-real-token');}
 override async request<T>(endpoint:string,method='GET'):Promise<T>{this.calls.push(method+' '+endpoint);if(!(endpoint in this.responses))throw Error('Unexpected network action: '+endpoint);return this.responses[endpoint] as T;}
}
const pr={head:{sha:'head'},merged:false,state:'open',mergeable:true,mergeable_state:'clean'};
const green={'pulls/1':pr,'commits/head/check-runs?per_page=100':{total_count:1,check_runs:[{name:'validate',status:'completed',conclusion:'success'}]},'commits/head/status':{statuses:[]}};
test('failed CI never requests merge',async()=>{
 const gh=new FixtureGitHub({...green,'commits/head/check-runs?per_page=100':{total_count:1,check_runs:[{name:'validate',status:'completed',conclusion:'failure'}]}});
 await assert.rejects(()=>gh.protectedMerge(1,'head'),/failed/);assert.ok(!gh.calls.some(c=>c.startsWith('PUT')));
});
test('pending human review waits without bypass; changed PR head stops',async()=>{
 const gh=new FixtureGitHub({...green,'pulls/1':{...pr,mergeable_state:'blocked'}});
 await assert.rejects(()=>gh.protectedMerge(1,'head'),Waiting);assert.ok(!gh.calls.some(c=>c.startsWith('PUT')));
 await assert.rejects(()=>gh.protectedMerge(1,'wrong'),/head changed/);
});
test('green PR is never production evidence and wrong deployment fails',async()=>{
 const gh=new FixtureGitHub({'actions/workflows/architecture-validation.yml/runs?branch=main&event=push&head_sha=merged&per_page=100':{workflow_runs:[{id:1,head_sha:'other',status:'completed',conclusion:'success'}]}});
 await assert.rejects(()=>gh.production('merged'),Waiting);
 const bad=new FixtureGitHub({'actions/workflows/architecture-validation.yml/runs?branch=main&event=push&head_sha=merged&per_page=100':{workflow_runs:[{id:1,head_sha:'merged',status:'completed',conclusion:'success'}]},'actions/runs/1/jobs?per_page=100':{jobs:[{name:'Deploy production',conclusion:'failure'}]}});
 await assert.rejects(()=>bad.production('merged'),/not successful/);
});
test('repository readiness endpoint has no trailing slash (GitHub root is strict)',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async input=>{assert.equal(String(input),'https://api.github.com/repos/paulzhang901-jpg/paulzhang-website');return Response.json({full_name:'paulzhang901-jpg/paulzhang-website'});};await new GitHub('not-a-real-token').request('');}
 finally{globalThis.fetch=original;}
});
test('commit identity uses authenticated actor noreply without global Git configuration',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async input=>{assert.equal(String(input),'https://api.github.com/user');return Response.json({id:123,login:'test-owner',name:'Test\nOwner'});};const identity=await new GitHub('not-a-real-token').commitIdentity();assert.deepEqual(identity,{name:'TestOwner',email:'123+test-owner@users.noreply.github.com'});}
 finally{globalThis.fetch=original;}
});
