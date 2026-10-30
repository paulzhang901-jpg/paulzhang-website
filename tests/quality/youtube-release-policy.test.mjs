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

test('ADR-0042 keeps the exact David pair fail-closed until genuine preview acceptance',async()=>{
 const {createHash}=await import('node:crypto');
 const {validateDavidGoliathYoutubeRelease:validate}=await import('../../src/lib/media-publishing/video-release-policy.mjs');
 assert.equal(typeof validate,'function');
 const ids={'zh-CN':'j4iVhPwUvK8','en-US':'nlt5tOE2AcE'};
 const source='synthetic test source, never production evidence';
 const r={schemaVersion:1,records:Object.entries(ids).map(([locale,videoId])=>({canonicalId:'bible-study-david-goliath-faith-over-fear',locale,videoId,provider:'youtube',channelId:'UCij02113c9lnl5oZeRKbE6Q',state:'PUBLISHED',kind:'production',sourceSha256:'a'.repeat(64),publishedAt:'2026-10-29T00:00:00Z',publicationEventId:'owner-david-goliath-youtube-20261029'})),sources:Object.keys(ids).map(locale=>({locale,sourcePath:'content/'+locale+'/library/david-and-goliath-faith-over-fear.mdx',sourceFileSha256:createHash('sha256').update(source).digest('hex'),sourceCommit:'b'.repeat(40)})),ownerAcceptance:{owner:'Paul Zhang',previewOrigin:'https://test-fixture.paulzhang-website-preview.pages.dev',iphoneSafariEvidence:'Synthetic test-only acceptance; no owner action is asserted.',recordedAt:'2026-10-29T00:00:00Z'}};
 const fixtureRead=(release=r)=>p=>p.endsWith('david-goliath-youtube-release.json')?Buffer.from(JSON.stringify(release)):Buffer.from(source);
 for(const c of r.records){
  assert.equal(validate(c,{policyAccepted:true,read:fixtureRead()}),true);
  assert.throws(()=>validate(c,{read:fixtureRead()}));
  for(const patch of [{locale:c.locale==='zh-CN'?'en-US':'zh-CN'},{videoId:'KQ6jdIFjB8c'},{channelId:'wrong'},{sourceSha256:'0'.repeat(64)}])assert.throws(()=>validate({...c,...patch},{policyAccepted:true,read:fixtureRead()}));
  for(const patch of [{ownerAcceptance:null},{records:[r.records[0]]},{records:[r.records[0],r.records[0]]},{ownerAcceptance:{...r.ownerAcceptance,previewOrigin:'https://paulzhang.org'}},{ownerAcceptance:{...r.ownerAcceptance,iphoneSafariEvidence:''}},{sources:r.sources.map(s=>({...s,sourceCommit:null}))}])assert.throws(()=>validate(c,{policyAccepted:true,read:fixtureRead({...r,...patch})}));
  assert.throws(()=>validate(c,{policyAccepted:true,read:p=>p.endsWith('.mdx')?Buffer.from('changed'):fixtureRead()(p)}));
 }
});
