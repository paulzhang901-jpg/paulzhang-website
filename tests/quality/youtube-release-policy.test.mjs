import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateYoutubeRelease} from '../../src/lib/media-publishing/video-release-policy.mjs';
const release=JSON.parse(fs.readFileSync('config/media-publishing/still-unrepentant-youtube-release.json','utf8'));
const read=p=>fs.readFileSync(p);
test('ADR-0038 requires the exact identity, accepted policy, source and preview evidence',()=>{
 assert.equal(validateYoutubeRelease(release.record,{policyAccepted:true,read}),true);
 assert.throws(()=>validateYoutubeRelease(release.record,{read}));
 for(const patch of [{videoId:'other'},{channelId:'other'},{locale:'en-US'},{canonicalId:'other'},{sourceSha256:'a'.repeat(64)}])
 assert.throws(()=>validateYoutubeRelease({...release.record,...patch},{policyAccepted:true,read}));
 assert.throws(()=>validateYoutubeRelease(release.record,{policyAccepted:true,read:p=>p===release.sourcePath?Buffer.from('changed'):read(p)}));
 const missing={...release,ownerAcceptance:null};
 assert.throws(()=>validateYoutubeRelease(release.record,{policyAccepted:true,read:p=>p.endsWith('still-unrepentant-youtube-release.json')?Buffer.from(JSON.stringify(missing)):read(p)}));
});

test('ADR-0040 requires exact bilingual bindings, unchanged sources and actual protected video acceptance',async()=>{
 const {validateNoMoreDelayYoutubeRelease}=await import('../../src/lib/media-publishing/video-release-policy.mjs');
 const r=JSON.parse(read('config/media-publishing/no-more-delay-youtube-release.json'));
 for(const c of r.records){
  assert.equal(validateNoMoreDelayYoutubeRelease(c,{policyAccepted:true,read}),true);
  assert.throws(()=>validateNoMoreDelayYoutubeRelease(c,{read}));
  for(const patch of [{videoId:'wrong'},{locale:c.locale==='zh-CN'?'en-US':'zh-CN'},{channelId:'wrong'},{canonicalId:'other'},{sourceSha256:'a'.repeat(64)}])assert.throws(()=>validateNoMoreDelayYoutubeRelease({...c,...patch},{policyAccepted:true,read}));
  for(const changed of [{...r,ownerAcceptance:null},{...r,records:[r.records[0]]},{...r,ownerAcceptance:{...r.ownerAcceptance,iphoneSafariEvidence:''}}])assert.throws(()=>validateNoMoreDelayYoutubeRelease(c,{policyAccepted:true,read:p=>p.endsWith('no-more-delay-youtube-release.json')?Buffer.from(JSON.stringify(changed)):read(p)}));
  assert.throws(()=>validateNoMoreDelayYoutubeRelease(c,{policyAccepted:true,read:p=>p===r.sources.find(s=>s.locale===c.locale).sourcePath?Buffer.from('changed'):read(p)}));
 }
});
