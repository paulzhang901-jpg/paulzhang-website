import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {validateVideoReleases} from '../../src/lib/media-publishing/video-release-policy.mjs';
const file='config/media-publishing/prayer-peace-direct-release.json';
const release=JSON.parse(fs.readFileSync(file));
const run=(record=release.record,{accepted=true,changeRelease=x=>x,changeAsset}={})=>validateVideoReleases({schemaVersion:1,releases:[]},{policyAccepted:true,prayerPeacePolicyAccepted:accepted,catalog:[record],read:p=>{
 if(p===file)return Buffer.from(JSON.stringify(changeRelease(structuredClone(release))));
 const data=fs.readFileSync(p);return changeAsset?changeAsset(p,data):data;
}});
test('fixed external original is admitted without adding an MP4 to local-media exceptions',()=>assert.equal(run().size,0));
test('external release still requires its accepted specific policy',()=>assert.throws(()=>run(release.record,{accepted:false}),/ADR-0043/));
test('changed URL, canonical ID, locale or publication identity never inherits the exception',()=>{
 for(const patch of [{mp4:release.record.mp4.replace('/sermon-prayer-peace-20261030/','/other/')},{canonicalId:'other'},{locale:'en-US'},{publicationEventId:'other'},{provider:'youtube'}])assert.throws(()=>run({...release.record,...patch}));
});
test('pending state, altered master identity, absent owner content acceptance or stale record fails closed',()=>{
 for(const change of [r=>({...r,state:'PENDING'}),r=>({...r,media:{...r.media,bytes:1}}),r=>({...r,ownerContentAcceptance:null}),r=>({...r,record:{...r.record,title:'Changed'}})])assert.throws(()=>run(release.record,{changeRelease:change}));
});
test('small auxiliary assets must match approved bytes and cover the record exactly',()=>{
 assert.throws(()=>run(release.record,{changeAsset:()=>Buffer.from('tampered')}));
 assert.throws(()=>run(release.record,{changeRelease:r=>({...r,assets:r.assets.slice(1)})}));
});

test('production CSP admits only self, the two fixed GitHub files and their redirect CDN',()=>{
 const header=fs.readFileSync('public/_headers','utf8').split('\n').find(l=>l.trimStart().startsWith('Content-Security-Policy:'));
 const media=header.split(';').map(s=>s.trim()).find(s=>s.startsWith('media-src '));
 assert.equal(media,"media-src 'self' "+release.media.url+' https://github.com/paulzhang901-jpg/paulzhang-website/releases/download/sermon-sweet-mouth-20261101/4cacb571f183ba4d63f27834a3f4cd75bec5d1bb50315d25e7a6e9720b6cbe8a.mp4 https://release-assets.githubusercontent.com');
 assert.ok(header.includes("object-src 'none'"));
 assert.ok(header.includes("frame-src https://www.youtube-nocookie.com"));
});
