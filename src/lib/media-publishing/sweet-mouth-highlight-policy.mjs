import {createHash} from 'node:crypto';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const requireValue=(ok,message)=>{if(!ok)throw Error(message);};
const same=(a,b)=>JSON.stringify(Object.fromEntries(Object.keys(a).sort().map(k=>[k,a[k]])))===JSON.stringify(Object.fromEntries(Object.keys(b).sort().map(k=>[k,b[k]])));

// Exact ADR-0045 release only. Does not grant future videos a hosting exception.
export function validateSweetMouthHighlightRelease(c,{policyAccepted=false,read}={}) {
 requireValue(policyAccepted===true,'Accepted ADR-0045 required');
 const sha='4cacb571f183ba4d63f27834a3f4cd75bec5d1bb50315d25e7a6e9720b6cbe8a';
 const url='https://github.com/paulzhang901-jpg/paulzhang-website/releases/download/sermon-sweet-mouth-20261101/'+sha+'.mp4';
 requireValue(c.canonicalId==='sermon-revelation-10-8-11' && c.locale==='zh-CN' && c.mp4===url && !Object.hasOwn(c,'provider') && !Object.hasOwn(c,'sourceKind') && c.state==='PUBLISHED' && c.kind==='production' && c.publicationEventId==='owner-sweet-mouth-highlight-20261101' && c.sourceSha256==='2c5342872059c4f0b5afd403ef71cfcaa40c197dfc7ccb82b0423e0ceae002f9','Unapproved ADR-0045 identity');
 const release=JSON.parse(read('config/media-publishing/sweet-mouth-highlight-release.json'));
 requireValue(release.schemaVersion===1 && release.state==='ACTIVE' && same(release.record,c),'ADR-0045 record mismatch');
 requireValue(release.sourcePath==='content/zh-CN/library/sweet-in-the-mouth-bitter-in-the-stomach.mdx' && release.sourceCommit==='43c31fefb0392cf710ee2098912e212de38d3b1f' && release.sourceFileSha256==='96fbf814fe4b762b6369d3122cb277fe12fdd3c4485435ff48cf6edc0813603e' && hash(read(release.sourcePath))===release.sourceFileSha256,'Stale ADR-0045 source');
 requireValue(release.media?.url===url && release.media.sha256===sha && release.media.bytes===21441999 && release.media.durationSeconds===277.791667 && release.media.width===1920 && release.media.height===1080,'ADR-0045 original media mismatch');
 requireValue(release.ownerAuthorization?.owner==='Paul Zhang' && typeof release.ownerAuthorization.evidence==='string' && release.ownerAuthorization.evidence.length>=40 && Number.isFinite(Date.parse(release.ownerAuthorization.recordedAt)) && Date.parse(release.ownerAuthorization.recordedAt)<=Date.now(),'Missing owner publication authorization');
 requireValue(Array.isArray(release.assets) && release.assets.length===3 && new Set(release.assets.map(a=>a.kind)).size===3 && release.assets.every(a=>['srt','captions','poster'].includes(a.kind)),'ADR-0045 auxiliary coverage mismatch');
 for(const asset of release.assets){
  const ext={srt:'srt',captions:'vtt',poster:'jpg'}[asset.kind];
  requireValue(Object.keys(asset).sort().join(',')==='bytes,kind,path,sha256' && /^[a-f0-9]{64}$/.test(asset.sha256) && asset.path==='media/video/'+asset.sha256+'.'+ext && Number.isSafeInteger(asset.bytes) && asset.bytes>0 && asset.bytes<=1024*1024 && c[asset.kind]==='/'+asset.path,'Invalid ADR-0045 auxiliary');
  const bytes=read('public/'+asset.path);requireValue(bytes.length===asset.bytes && hash(bytes)===asset.sha256,'ADR-0045 auxiliary integrity mismatch');
 }
 return true;
}
