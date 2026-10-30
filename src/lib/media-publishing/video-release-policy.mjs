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

// ADR-0040 exact bilingual exception. This checks consistency, never human identity.
export function validateNoMoreDelayYoutubeRelease(c,{policyAccepted=false,read}={}) {
 requireValue(policyAccepted===true,'Accepted ADR-0040 required');
 const ids={'zh-CN':'KQ6jdIFjB8c','en-US':'q8q67bsI3t0'};
 const exact=r=>r.canonicalId==='sermon-revelation-10-5-7' &&
  Object.hasOwn(ids,r.locale) && r.videoId===ids[r.locale] && r.channelId==='UCij02113c9lnl5oZeRKbE6Q' &&
  r.provider==='youtube' && r.state==='PUBLISHED' && r.kind==='production' &&
  r.publicationEventId==='owner-no-more-delay-youtube-20261027';
 requireValue(exact(c),'Unapproved ADR-0040 YouTube identity');
 const release=JSON.parse(read('config/media-publishing/no-more-delay-youtube-release.json'));
 requireValue(release.schemaVersion===1 && release.records?.length===2 &&
  new Set(release.records.map(r=>r.locale)).size===2 && release.records.every(exact) &&
  release.records.some(r=>catalogHash(r)===catalogHash(c)),'ADR-0040 release binding mismatch');
 requireValue(release.sources?.length===2 && new Set(release.sources.map(s=>s.locale)).size===2,'Complete ADR-0040 sources required');
 for(const source of release.sources) requireValue(Object.hasOwn(ids,source.locale) &&
  source.sourcePath==='content/'+source.locale+'/library/the-day-of-no-more-delay.mdx' &&
  digest(source.sourceFileSha256) && hash(read(source.sourcePath))===source.sourceFileSha256 &&
  /^[a-f0-9]{40}$/.test(source.sourceCommit),'Stale ADR-0040 source');
 const a=release.ownerAcceptance;
 requireValue(a?.owner==='Paul Zhang' && a.previewOrigin==='https://b2e861de.paulzhang-website-preview.pages.dev' &&
  typeof a.iphoneSafariEvidence==='string' && a.iphoneSafariEvidence.length>=40 &&
  Number.isFinite(Date.parse(a.recordedAt)) && Date.parse(a.recordedAt)<=Date.now(),'Missing ADR-0040 owner video acceptance');
 return true;
}

// ADR-0042 exact bilingual exception. This checks consistency, never human identity.
export function validateDavidGoliathYoutubeRelease(c,{policyAccepted=false,read}={}) {
 requireValue(policyAccepted===true,'Accepted ADR-0042 required');
 const ids={'zh-CN':'j4iVhPwUvK8','en-US':'nlt5tOE2AcE'};
 const exact=r=>r.canonicalId==='bible-study-david-goliath-faith-over-fear' &&
  Object.hasOwn(ids,r.locale) && r.videoId===ids[r.locale] && r.channelId==='UCij02113c9lnl5oZeRKbE6Q' &&
  r.provider==='youtube' && r.state==='PUBLISHED' && r.kind==='production' &&
  r.publicationEventId==='owner-david-goliath-youtube-20261029';
 requireValue(exact(c),'Unapproved ADR-0042 YouTube identity');
 const release=JSON.parse(read('config/media-publishing/david-goliath-youtube-release.json'));
 requireValue(release.schemaVersion===1 && release.records?.length===2 &&
  new Set(release.records.map(r=>r.locale)).size===2 && release.records.every(exact) &&
  release.records.some(r=>catalogHash(r)===catalogHash(c)),'ADR-0042 release binding mismatch');
 requireValue(release.sources?.length===2 && new Set(release.sources.map(s=>s.locale)).size===2,'Complete ADR-0042 sources required');
 for(const source of release.sources) requireValue(Object.hasOwn(ids,source.locale) &&
  source.sourcePath==='content/'+source.locale+'/library/david-and-goliath-faith-over-fear.mdx' &&
  digest(source.sourceFileSha256) && hash(read(source.sourcePath))===source.sourceFileSha256 &&
  /^[a-f0-9]{40}$/.test(source.sourceCommit),'Stale ADR-0042 source');
 const a=release.ownerAcceptance;
 requireValue(a?.owner==='Paul Zhang' && typeof a.previewOrigin==='string' && /^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.paulzhang-website-preview\.pages\.dev$/.test(a.previewOrigin) &&
  typeof a.iphoneSafariEvidence==='string' && a.iphoneSafariEvidence.length>=40 &&
  Number.isFinite(Date.parse(a.recordedAt)) && Date.parse(a.recordedAt)<=Date.now(),'Missing ADR-0042 owner video acceptance');
 return true;
}

// Validates evidence consistency, NOT owner identity or authorization. Authenticated
// GitHub final-head approval and separate production permission remain external gates.
export function validateVideoReleases(registry,{policyAccepted=false,youtubePolicyAccepted=false,noMoreDelayPolicyAccepted=false,davidGoliathPolicyAccepted=false,standalonePolicyAccepted=false,read,catalog=[],narrations=[]}={}){
 keys(registry,['schemaVersion','releases'],'registry');
 requireValue(registry.schemaVersion===1 && Array.isArray(registry.releases),'Invalid release registry');
 requireValue(!registry.releases.length || policyAccepted===true,'Accepted ADR-0037 required before registering releases');
 const active=new Set();
 const approved=new Map(),ids=new Set(),identities=new Set();
 for(const release of registry.releases){
  const standalone=release.sourceKind==='standalone';
  keys(release,['id','state','canonicalId','sourceCommit','ownerAcceptance','locales',...(standalone?['sourceKind']:[])],'release');
  if(standalone)requireValue(standalonePolicyAccepted===true,'Accepted standalone ADR-0037 amendment required');
  requireValue(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(release.id) && !ids.has(release.id),'Invalid or duplicate release ID');ids.add(release.id);
  requireValue(typeof release.canonicalId==='string' && /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(release.canonicalId),'Invalid canonical identity');
  requireValue(typeof release.sourceCommit==='string' && /^[a-f0-9]{40}$/.test(release.sourceCommit),'Invalid source commit');
  requireValue(['ACTIVE','RETIRED'].includes(release.state),'Invalid release state');
  if(release.state==='RETIRED')requireValue(!catalog.some(c=>c.publicationEventId===release.id),'Retired release cannot remain in runtime catalog');
  const a=release.ownerAcceptance;
  keys(a,['owner','acceptedAt','previewOrigin','iphoneSafariEvidence'],'owner acceptance');
  requireValue(a.owner==='paulzhang901-jpg' && typeof a.acceptedAt==='string' && /^\d{4}-\d\d-\d\dT/.test(a.acceptedAt) && Number.isFinite(Date.parse(a.acceptedAt)) && Date.parse(a.acceptedAt)<=Date.now() && typeof a.iphoneSafariEvidence==='string' && a.iphoneSafariEvidence.trim().length>=20,'Invalid owner iPhone acceptance');
  requireValue(typeof a.previewOrigin==='string' && /^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.paulzhang-website-preview\.pages\.dev$/.test(a.previewOrigin),'Invalid protected preview acceptance origin');
  requireValue(Array.isArray(release.locales) && (standalone ? release.locales.length>=1 && release.locales.length<=2 : release.locales.length===2) && new Set(release.locales.map(e=>e.locale)).size===release.locales.length && release.locales.every(e=>['zh-CN','en-US'].includes(e.locale)),'Complete bilingual locales required');
  let releaseBytes=0;
  for(const entry of release.locales){
   keys(entry,standalone?['locale','presentationSha256','assets']:['locale','sourcePath','sourceFileSha256','presentationSha256','assets'],'locale');
   const identity=release.canonicalId+':'+entry.locale;
   if(release.state==='ACTIVE'){requireValue(!identities.has(identity),'Duplicate canonical locale identity');identities.add(identity);active.add(identity+':'+release.id);}
   if(!standalone)requireValue(typeof entry.sourcePath==='string' && new RegExp('^content/'+entry.locale+'/library/[a-z0-9]+(?:-[a-z0-9]+)*\\.mdx$').test(entry.sourcePath),'Invalid source path');
   requireValue((standalone || digest(entry.sourceFileSha256)) && digest(entry.presentationSha256),'Invalid source hash');
   requireValue(Array.isArray(entry.assets) && (standalone ? entry.assets.length>=1 && entry.assets.length<=4 && entry.assets.some(a=>a.kind==='mp4') : entry.assets.length===4) && new Set(entry.assets.map(e=>e.kind)).size===entry.assets.length && entry.assets.every(e=>['mp4','srt','captions','poster'].includes(e.kind)),'Complete MP4/SRT/VTT/poster required');
   let c;
   if(release.state==='ACTIVE'){
   const matches=catalog.filter(c=>c.canonicalId===release.canonicalId && c.locale===entry.locale);
   requireValue(matches.length===1,'Exactly one matching video catalog record required');c=matches[0];
   requireValue(c.state==='PUBLISHED' && c.kind==='production' && c.publicationEventId===release.id && c.sourceSha256===entry.presentationSha256,'Mismatched video catalog release binding');
   if(standalone){
    const required=['canonicalId','locale','state','kind','sourceSha256','mp4','publishedAt','publicationEventId','sourceKind','category','videoType','title','primaryPage'];
    requireValue(required.every(k=>Object.hasOwn(c,k)) && Object.keys(c).every(k=>[...required,'poster','captions','srt'].includes(k)), 'Invalid standalone catalog fields');
    requireValue(c.sourceKind==='standalone' && c.category==='approved-standalone-videos' && ['biography','testimony','sermon','reading-notes'].includes(c.videoType) && typeof c.title==='string' && c.title.trim().length>0,'Invalid standalone metadata');
    requireValue(typeof c.primaryPage==='string' && new RegExp('^'+(c.locale==='en-US'?'/en':'')+(c.videoType==='reading-notes'?'/videos/[a-z0-9]+(?:-[a-z0-9]+)*$':'/about/profile#[a-z0-9]+(?:-[a-z0-9]+)*$')).test(c.primaryPage),'Invalid standalone primary page');
    const mp4=entry.assets.find(a=>a.kind==='mp4');
    requireValue(hash(JSON.stringify({policy:'standalone-video-presentation/v1',canonicalId:c.canonicalId,locale:c.locale,title:c.title,videoType:c.videoType,primaryPage:c.primaryPage,mp4Sha256:mp4.sha256}))===entry.presentationSha256,'Stale standalone metadata');
    requireValue(['mp4','poster','captions','srt'].every(kind=>Boolean(c[kind])===entry.assets.some(a=>a.kind===kind)),'Standalone asset coverage mismatch');
   }else{
   requireValue(!Object.hasOwn(c,'sourceKind'),'Article release cannot bind standalone record');
   requireValue(narrations.some(n=>n.canonicalId===release.canonicalId && n.locale===entry.locale && n.state==='PUBLISHED' && n.kind==='production' && n.sourceSha256===entry.sourceFileSha256),'Existing published narration/source binding required');
   requireValue(hash(read(entry.sourcePath))===entry.sourceFileSha256,'Stale source bytes');
   }
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
 const catalogIdentities=new Set(),standaloneDestinations=new Set();
 for(const c of catalog){
  const identity=c.canonicalId+':'+c.locale;
  requireValue(!catalogIdentities.has(identity),'Duplicate runtime catalog identity');catalogIdentities.add(identity);
  if(c.sourceKind==='standalone'){requireValue(!standaloneDestinations.has(c.primaryPage),'Duplicate standalone presentation destination');standaloneDestinations.add(c.primaryPage);}
  if(c.provider === 'youtube') {
   if(c.canonicalId==='sermon-revelation-10-5-7') validateNoMoreDelayYoutubeRelease(c,{policyAccepted:noMoreDelayPolicyAccepted,read});
   else if(c.canonicalId==='bible-study-david-goliath-faith-over-fear') validateDavidGoliathYoutubeRelease(c,{policyAccepted:davidGoliathPolicyAccepted,read});
   else validateYoutubeRelease(c,{policyAccepted:youtubePolicyAccepted,read});
  }
  else requireValue(LEGACY_CATALOG_HASHES.has(catalogHash(c)) || active.has(identity+':'+c.publicationEventId),'Runtime video lacks active governed release evidence');
 }
 return approved;
}
