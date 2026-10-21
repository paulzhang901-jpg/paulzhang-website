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

test('official references reject missing acceptance, unknown identities and cross-locale substitution', async()=>{
 const {validateOfficialVideoReference}=await import('../../src/lib/media-publishing/video-release-policy.mjs');
 const fixture={referenceId:'official-hymn-this-is-my-story',locale:'en-US',provider:'youtube',videoId:'PkAcmwSGzkE',
 channelId:'UCij02113c9lnl5oZeRKbE6Q',state:'PUBLISHED',kind:'production',
 ownerAcceptance:{previewUrl:'https://test.paulzhang-website-preview.pages.dev/en/videos/this-is-my-story',recordedAt:'2026-01-01T00:00:00Z',evidence:'TEST FIXTURE ONLY, not authenticated owner acceptance'}};
 assert.equal(validateOfficialVideoReference(fixture,{policyAccepted:true}),true);
 assert.throws(()=>validateOfficialVideoReference(fixture));
 for(const patch of [{videoId:'other'},{locale:'zh-CN'},{channelId:'other'},{ownerAcceptance:null},{referenceId:'other'}])
 assert.throws(()=>validateOfficialVideoReference({...fixture,...patch},{policyAccepted:true}));
});
