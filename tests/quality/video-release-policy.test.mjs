import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateVideoReleases, VIDEO_LIMITS} from '../../src/lib/media-publishing/video-release-policy.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
function fixture(){
 const files=new Map(),catalog=[],narrations=[];
 const release={id:'owner-video-fixture',state:'ACTIVE',canonicalId:'article-fixture',sourceCommit:'a'.repeat(40),ownerAcceptance:{owner:'paulzhang901-jpg',acceptedAt:'2020-01-01T00:00:00Z',previewOrigin:'https://fixture.paulzhang-website-preview.pages.dev',iphoneSafariEvidence:'Owner explicitly confirmed both exact tested language assets on iPhone Safari.'},locales:[]};
 for(const locale of ['zh-CN','en-US']){
  const source=Buffer.from(`approved source ${locale}`),sourcePath=`content/${locale}/library/fixture.mdx`;files.set(sourcePath,source);
  const entry={locale,sourcePath,sourceFileSha256:hash(source),presentationSha256:'b'.repeat(64),assets:[]};
  const cat={canonicalId:release.canonicalId,locale,state:'PUBLISHED',kind:'production',sourceSha256:entry.presentationSha256,publicationEventId:release.id};
  for(const [kind,ext] of [['mp4','mp4'],['srt','srt'],['captions','vtt'],['poster','png']]){
   const bytes=Buffer.from(`${locale} ${kind}`),sha256=hash(bytes),path=`media/video/${sha256}.${ext}`;files.set('public/'+path,bytes);entry.assets.push({kind,path,sha256,bytes:bytes.length});cat[kind]='/'+path;
  }
  release.locales.push(entry);catalog.push(cat);narrations.push({canonicalId:release.canonicalId,locale,state:'PUBLISHED',kind:'production',sourceSha256:entry.sourceFileSha256});
 }
 return {registry:{schemaVersion:1,releases:[release]},options:{policyAccepted:true,read:path=>{assert.ok(files.has(path),'unknown fixture path '+path);return files.get(path);},catalog,narrations},files};
}
const run=f=>validateVideoReleases(f.registry,f.options);
test('empty proposed registry admits no assets; nonempty registry needs accepted policy',()=>{assert.deepEqual([...validateVideoReleases({schemaVersion:1,releases:[]},{policyAccepted:false})],[]);const f=fixture();f.options.policyAccepted=false;assert.throws(()=>run(f),/Accepted ADR/);});
test('complete exact bilingual release admits only its exact MP4 budget paths',()=>{const f=fixture();const result=run(f);assert.equal(result.size,2);for(const [key,bytes]of result){assert.match(key,/^media\/video\/[a-f0-9]{64}\.mp4$/);assert.ok(bytes>0);}});
test('reject modified bytes and dishonest size/hash claims',()=>{for(const mode of ['bytes','hash','file']){const f=fixture(),a=f.registry.releases[0].locales[0].assets[0];if(mode==='bytes')a.bytes++;if(mode==='hash')a.sha256='c'.repeat(64);if(mode==='file')f.files.set('public/'+a.path,Buffer.from('tampered'));assert.throws(()=>run(f));}});
test('reject unsafe/non-content-addressed paths before reading',()=>{for(const value of ['../secret.mp4','media/video/../../secret.mp4','media/video/test.mp4','https://elsewhere/test.mp4']){const f=fixture();f.registry.releases[0].locales[0].assets[0].path=value;assert.throws(()=>run(f),/path/);}});
test('reject oversize MP4/subtitles and pin cumulative/package ceilings',()=>{for(const [kind,bytes]of [['mp4',VIDEO_LIMITS.mp4Bytes+1],['srt',VIDEO_LIMITS.auxiliaryBytes+1]]){const f=fixture();f.registry.releases[0].locales[0].assets.find(a=>a.kind===kind).bytes=bytes;assert.throws(()=>run(f),/budget/);}assert.equal(VIDEO_LIMITS.releaseBytes,64*1024*1024);assert.equal(VIDEO_LIMITS.repositoryMediaBytes,256*1024*1024);});
test('reject missing locale, duplicate identity and incomplete media',()=>{for(const mode of ['locale','identity','asset']){const f=fixture();if(mode==='locale')f.registry.releases[0].locales.pop();if(mode==='identity')f.registry.releases.push(structuredClone(f.registry.releases[0]));if(mode==='asset')f.registry.releases[0].locales[0].assets.pop();assert.throws(()=>run(f));}});
test('reject missing or malformed iPhone evidence and public/unapproved preview origin',()=>{for(const change of [a=>delete a.iphoneSafariEvidence,a=>a.acceptedAt='not-a-date',a=>a.previewOrigin='https://mobile-test.paulzhang.org',a=>a.owner='someone-else']){const f=fixture();change(f.registry.releases[0].ownerAcceptance);assert.throws(()=>run(f),/acceptance/);}});
test('reject stale source bytes, absent narration and mismatched runtime catalog',()=>{for(const mode of ['source','narration','catalog','event']){const f=fixture();if(mode==='source')f.files.set(f.registry.releases[0].locales[0].sourcePath,Buffer.from('changed'));if(mode==='narration')f.options.narrations=[];if(mode==='catalog')f.options.catalog[0].mp4='/wrong.mp4';if(mode==='event')f.options.catalog[0].publicationEventId='other';assert.throws(()=>run(f));}});
test('reject unknown metadata rather than treating local flags as authorization',()=>{const f=fixture();f.registry.releases[0].approved=true;assert.throws(()=>run(f),/Unknown/);});

test('retirement preserves exact immutable assets without publishing stale source',()=>{const f=fixture();f.registry.releases[0].state='RETIRED';f.options.catalog=[];f.options.narrations=[];f.files.delete(f.registry.releases[0].locales[0].sourcePath);assert.equal(run(f).size,2);f.options.catalog=[{publicationEventId:'owner-video-fixture'}];assert.throws(()=>run(f),/Retired/);});
test('only one active release may own a canonical locale, but retired history may coexist',()=>{const f=fixture();const retired=structuredClone(f.registry.releases[0]);retired.id='older-release';retired.state='RETIRED';f.registry.releases.push(retired);assert.equal(run(f).size,2);retired.state='ACTIVE';assert.throws(()=>run(f));});

test('unregistered runtime videos cannot bypass policy using small or external MP4s',()=>{for(const mp4 of ['/media/video/small.mp4','https://elsewhere.example/video.mp4']){const f=fixture();f.registry.releases=[];f.options.policyAccepted=false;f.options.catalog[0].mp4=mp4;assert.throws(()=>run(f),/lacks active governed/);}});
test('legacy runtime grandfathering pins exact existing records only',async()=>{const {readFileSync}=await import('node:fs');const catalog=JSON.parse(readFileSync('config/media-publishing/published-videos.json')).records.filter(entry=>entry.canonicalId==='article-what-is-true-faith');assert.equal(catalog.length,2);assert.equal(validateVideoReleases({schemaVersion:1,releases:[]},{catalog}).size,0);const changed=structuredClone(catalog);changed[0].mp4='/media/video/replacement.mp4';assert.throws(()=>validateVideoReleases({schemaVersion:1,releases:[]},{catalog:changed}),/lacks active governed/);});

function standaloneFixture(){
 const f=fixture(),r=f.registry.releases[0],e=r.locales[0],c=f.options.catalog[0];
 r.sourceKind='standalone';r.locales=[e];f.options.catalog=[c];f.options.narrations=[];
 delete e.sourcePath; delete e.sourceFileSha256;e.assets=e.assets.filter(a=>a.kind==='mp4');
 for(const key of ['srt','captions','poster']) delete c[key];
 Object.assign(c,{publishedAt:'2020-01-01T00:00:00Z',sourceKind:'standalone',category:'approved-standalone-videos',videoType:'biography',title:'牧师的旅程',primaryPage:'/about/profile#pastor-biography-video'});
 const fingerprint=hash(JSON.stringify({policy:'standalone-video-presentation/v1',canonicalId:c.canonicalId,locale:c.locale,title:c.title,videoType:c.videoType,primaryPage:c.primaryPage,mp4Sha256:e.assets[0].sha256}));
 e.presentationSha256=c.sourceSha256=fingerprint;
 f.options.standalonePolicyAccepted=true;return f;
}
test('approved standalone release requires only supplied locale and MP4 without fabricated narration',()=>{assert.equal(run(standaloneFixture()).size,1);});
test('standalone still rejects missing approval, stale metadata, unknown fields, extra assets and unsafe category',()=>{
 for(const change of [f=>f.options.standalonePolicyAccepted=false,f=>f.options.catalog[0].title='changed',f=>f.options.catalog[0].category='other',f=>f.options.catalog[0].primaryPage='//evil.example',f=>f.options.catalog[0].videoType='film',f=>f.options.catalog[0].approved=true,f=>f.options.catalog[0].poster='/media/video/'+ 'a'.repeat(64)+'.png',f=>delete f.registry.releases[0].ownerAcceptance]){
 const f=standaloneFixture();change(f);assert.throws(()=>run(f));
 }
});
