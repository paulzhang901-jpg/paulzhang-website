import {createHash} from 'node:crypto';

export const VIDEO_LIMITS = Object.freeze({mp4Bytes:25*1024*1024, auxiliaryBytes:1024*1024, releaseBytes:64*1024*1024, repositoryMediaBytes:256*1024*1024});
const hash = value => createHash('sha256').update(value).digest('hex');
const requireValue = (condition,message) => {if (!condition) throw new Error(message);};
function keys(value,allowed,label){
 requireValue(value && typeof value==='object' && !Array.isArray(value),`Invalid ${label}`);
 requireValue(Object.keys(value).every(key=>allowed.includes(key)),`Unknown ${label} field`);
 requireValue(allowed.every(key=>Object.hasOwn(value,key)),`Missing ${label} field`);
}
// Exact existing ADR-0036 runtime records at base a814c7b. No future records
// inherit this grandfathering; changed fields invalidate the fingerprint.
const LEGACY_CATALOG_HASHES=new Set(['1d690baf2674ba3c4904ca7d3b736fe90fc633d2a96ad97027ac7f4325f095f6','0b9531ff636d726b412560f49a9aeadd9ed27ac14586a527a5c358db5af83032']);
const catalogHash=c=>hash(JSON.stringify(Object.fromEntries(Object.keys(c).sort().map(k=>[k,c[k]]))));
const digest=value=>typeof value==='string' && /^[a-f0-9]{64}$/.test(value);


// ADR-0038 exact exception. Evidence consistency is not authenticated GitHub approval.
export function validateYoutubeRelease(c, {policyAccepted=false, read}={}) {
 requireValue(policyAccepted === true, 'Accepted ADR-0038 required');
 requireValue(c.canonicalId === 'sermon-revelation-9-20-21' && c.locale === 'zh-CN' &&
 c.provider === 'youtube' && c.videoId === '0J44f6acTeQ' &&
 c.channelId === 'UCij02113c9lnl5oZeRKbE6Q' &&
 c.publicationEventId === 'owner-still-unrepentant-youtube-20261020' &&
 c.state === 'PUBLISHED' && c.kind === 'production', 'Unapproved YouTube identity');
 const release=JSON.parse(read('config/media-publishing/still-unrepentant-youtube-release.json'));
 requireValue(release.schemaVersion === 1 && catalogHash(release.record) === catalogHash(c), 'YouTube release binding mismatch');
 requireValue(release.sourcePath === 'content/zh-CN/library/still-they-did-not-repent.mdx' &&
 digest(release.sourceFileSha256) && hash(read(release.sourcePath)) === release.sourceFileSha256 &&
 /^[a-f0-9]{40}$/.test(release.sourceCommit), 'Stale YouTube source');
 const a=release.ownerAcceptance;
 requireValue(a?.owner === 'Paul Zhang' &&
 a.previewUrl === 'https://47d226e4.paulzhang-website-preview.pages.dev/videos/still-they-did-not-repent' &&
 typeof a.evidence === 'string' && a.evidence.length >= 40 &&
 Number.isFinite(Date.parse(a.recordedAt)) && Date.parse(a.recordedAt) <= Date.now(), 'Missing YouTube owner acceptance');
 return true;
}

// Validates evidence consistency, NOT owner identity or authorization. Authenticated
// GitHub final-head approval and separate production permission remain external gates.
export function validateVideoReleases(registry,{policyAccepted=false,youtubePolicyAccepted=false,read,catalog=[],narrations=[]}={}){
 keys(registry,['schemaVersion','releases'],'registry');
 requireValue(registry.schemaVersion===1 && Array.isArray(registry.releases),'Invalid release registry');
 requireValue(!registry.releases.length || policyAccepted===true,'Accepted ADR-0037 required before registering releases');
 const active=new Set();
 const approved=new Map(),ids=new Set(),identities=new Set();
 for(const release of registry.releases){
  keys(release,['id','state','canonicalId','sourceCommit','ownerAcceptance','locales'],'release');
  requireValue(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(release.id) && !ids.has(release.id),'Invalid or duplicate release ID');ids.add(release.id);
  requireValue(typeof release.canonicalId==='string' && /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(release.canonicalId),'Invalid canonical identity');
  requireValue(typeof release.sourceCommit==='string' && /^[a-f0-9]{40}$/.test(release.sourceCommit),'Invalid source commit');
  requireValue(['ACTIVE','RETIRED'].includes(release.state),'Invalid release state');
  if(release.state==='RETIRED')requireValue(!catalog.some(c=>c.publicationEventId===release.id),'Retired release cannot remain in runtime catalog');
  const a=release.ownerAcceptance;
  keys(a,['owner','acceptedAt','previewOrigin','iphoneSafariEvidence'],'owner acceptance');
  requireValue(a.owner==='paulzhang901-jpg' && typeof a.acceptedAt==='string' && /^\d{4}-\d\d-\d\dT/.test(a.acceptedAt) && Number.isFinite(Date.parse(a.acceptedAt)) && Date.parse(a.acceptedAt)<=Date.now() && typeof a.iphoneSafariEvidence==='string' && a.iphoneSafariEvidence.trim().length>=20,'Invalid owner iPhone acceptance');
  requireValue(typeof a.previewOrigin==='string' && /^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.paulzhang-website-preview\.pages\.dev$/.test(a.previewOrigin),'Invalid protected preview acceptance origin');
  requireValue(Array.isArray(release.locales) && release.locales.length===2 && new Set(release.locales.map(e=>e.locale)).size===2 && release.locales.every(e=>['zh-CN','en-US'].includes(e.locale)),'Complete bilingual locales required');
  let releaseBytes=0;
  for(const entry of release.locales){
   keys(entry,['locale','sourcePath','sourceFileSha256','presentationSha256','assets'],'locale');
   const identity=release.canonicalId+':'+entry.locale;
   if(release.state==='ACTIVE'){requireValue(!identities.has(identity),'Duplicate canonical locale identity');identities.add(identity);active.add(identity+':'+release.id);}
   requireValue(typeof entry.sourcePath==='string' && new RegExp('^content/'+entry.locale+'/library/[a-z0-9]+(?:-[a-z0-9]+)*\\.mdx$').test(entry.sourcePath),'Invalid source path');
   requireValue(digest(entry.sourceFileSha256) && digest(entry.presentationSha256),'Invalid source hash');
   requireValue(Array.isArray(entry.assets) && entry.assets.length===4 && new Set(entry.assets.map(e=>e.kind)).size===4 && entry.assets.every(e=>['mp4','srt','captions','poster'].includes(e.kind)),'Complete MP4/SRT/VTT/poster required');
   let c;
   if(release.state==='ACTIVE'){
   const matches=catalog.filter(c=>c.canonicalId===release.canonicalId && c.locale===entry.locale);
   requireValue(matches.length===1,'Exactly one matching video catalog record required');c=matches[0];
   requireValue(c.state==='PUBLISHED' && c.kind==='production' && c.publicationEventId===release.id && c.sourceSha256===entry.presentationSha256,'Mismatched video catalog release binding');
   requireValue(narrations.some(n=>n.canonicalId===release.canonicalId && n.locale===entry.locale && n.state==='PUBLISHED' && n.kind==='production' && n.sourceSha256===entry.sourceFileSha256),'Existing published narration/source binding required');
   requireValue(hash(read(entry.sourcePath))===entry.sourceFileSha256,'Stale source bytes');
   }
   for(const asset of entry.assets){
    keys(asset,['kind','path','sha256','bytes'],'asset');
    const extension={mp4:'mp4',srt:'srt',captions:'vtt',poster:'(?:png|jpg|jpeg|webp|avif)'}[asset.kind];
    requireValue(digest(asset.sha256) && typeof asset.path==='string' && new RegExp('^media/video/'+asset.sha256+'\\.'+extension+'$').test(asset.path),'Invalid content-addressed asset path');
    const limit=asset.kind==='mp4'?VIDEO_LIMITS.mp4Bytes:VIDEO_LIMITS.auxiliaryBytes;
    requireValue(Number.isSafeInteger(asset.bytes) && asset.bytes>0 && asset.bytes<=limit,'Asset budget exceeded');
    releaseBytes+=asset.bytes;requireValue(releaseBytes<=VIDEO_LIMITS.releaseBytes,'Release budget exceeded');
    if(c)requireValue(c[asset.kind]==='/'+asset.path,'Mismatched catalog asset path');
    const bytes=read('public/'+asset.path);
    requireValue(bytes.length===asset.bytes && hash(bytes)===asset.sha256,'Asset size/hash mismatch');
    if(asset.kind==='mp4')approved.set(asset.path,asset.bytes);
   }
  }
 }
 const catalogIdentities=new Set();
 for(const c of catalog){
  const identity=c.canonicalId+':'+c.locale;
  requireValue(!catalogIdentities.has(identity),'Duplicate runtime catalog identity');catalogIdentities.add(identity);
  if(c.provider === 'youtube') validateYoutubeRelease(c,{policyAccepted:youtubePolicyAccepted,read});
  else requireValue(LEGACY_CATALOG_HASHES.has(catalogHash(c)) || active.has(identity+':'+c.publicationEventId),'Runtime video lacks active governed release evidence');
 }
 return approved;
}
