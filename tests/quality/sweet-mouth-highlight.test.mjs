import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {validateSweetMouthHighlightRelease} from '../../src/lib/media-publishing/sweet-mouth-highlight-policy.mjs';
const release=JSON.parse(fs.readFileSync('config/media-publishing/sweet-mouth-highlight-release.json','utf8'));
const read=p=>fs.readFileSync(p);
test('only this immutable highlight and unchanged source are admitted',()=>{
 assert.equal(validateSweetMouthHighlightRelease(release.record,{policyAccepted:true,read}),true);
 assert.throws(()=>validateSweetMouthHighlightRelease(release.record,{policyAccepted:false,read}));
 for(const patch of [{locale:'en-US'},{canonicalId:'other'},{mp4:'https://example.com/a.mp4'},{sourceSha256:'0'.repeat(64)}])assert.throws(()=>validateSweetMouthHighlightRelease({...release.record,...patch},{policyAccepted:true,read}));
 assert.throws(()=>validateSweetMouthHighlightRelease(release.record,{policyAccepted:true,read:p=>p===release.sourcePath?Buffer.from('changed'):read(p)}));
 const poster=release.assets.find(a=>a.kind==='poster');
 assert.throws(()=>validateSweetMouthHighlightRelease(release.record,{policyAccepted:true,read:p=>p==='public/'+poster.path?Buffer.from('changed'):read(p)}));
});
