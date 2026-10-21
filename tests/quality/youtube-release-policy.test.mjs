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
