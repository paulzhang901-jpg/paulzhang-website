import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {discoverAndParseContent} from "../../src/lib/content/discovery";
import {normalizeContent} from "../../src/lib/content/normalize";
import {narrationPresentationHash, resolvePublishedNarration, validateNarrationCatalog} from "../../src/lib/content/published-narrations";

test("published bilingual sermon audio matches the owner-authorized unchanged sources and exact assets", () => {
 const release = JSON.parse(fs.readFileSync("config/media-publishing/releases/sermon-revelation-9-20-21.json","utf8"));
 const catalog = validateNarrationCatalog(JSON.parse(fs.readFileSync("config/media-publishing/published-narrations.json","utf8")));
 const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
 const expected = {
  "zh-CN": {audio:"051402cbabaf7f999ff367335d49eca60d731033de486a22e6b7934f5e3b4597",profile:"244bbed5-2976-4803-9af0-55d15326bffb"},
  "en-US": {audio:"f6273a399805a30c51eb06c112a74adc412911d87c8f84769fb9169df0c3bcdf",profile:"1ab6bf84-7d30-4983-ac6c-13a1acc296d2"},
 };
 assert.equal(release.ownerSubject,"paulzhang901-jpg");
 assert.equal(release.canonicalId,"sermon-revelation-9-20-21");
 assert.equal(release.sourceHashPolicy,"sha256-published-mdx-bytes/v1");
 assert.equal(release.actualIPhoneAcceptance,"PENDING_POST_RELEASE");
 assert.match(fs.readFileSync("docs/adr/0032-production-narration-governance.md","utf8"),/Owner-authorized one-time static sermon release exception/);
 const items=discoverAndParseContent().map(normalizeContent).filter(item=>item.canonicalId===release.canonicalId);
 assert.equal(items.length,2);
 const entries=catalog.records.filter(row=>row.canonicalId===release.canonicalId);
 assert.equal(entries.length,2);
 assert.equal(release.assets.length,2);
 for(const item of items) {
  const asset=release.assets.find((row:{locale:string})=>row.locale===item.language);
  const entry=entries.find(row=>row.locale===item.language);
  assert.ok(asset);assert.ok(entry);
  assert.equal(entry.publicationEventId,release.id);
  assert.equal(entry.audioSha256,expected[item.language].audio);
  assert.equal(entry.voiceProfileId,expected[item.language].profile);
  assert.equal(asset.voice.locale,item.language);
  assert.equal(entry.voiceConfigSha256,hash(JSON.stringify(asset.voice)));
  assert.equal(entry.sourceSha256,hash(fs.readFileSync(asset.sourcePath)));
  assert.equal(entry.presentationSha256,narrationPresentationHash(item));
  assert.deepEqual(resolvePublishedNarration(item),{src:entry.src,audioSha256:entry.audioSha256});
  const audio=fs.readFileSync("public"+entry.src);
  assert.equal(audio.length,asset.bytes);
  assert.equal(hash(audio),entry.audioSha256);
 }
});

test("Knowledge and Wisdom candidate players bind both approved MP3s to unchanged canonical articles", () => {
 const release = JSON.parse(fs.readFileSync("config/media-publishing/releases/knowledge-and-wisdom.json", "utf8"));
 const catalog = validateNarrationCatalog(JSON.parse(fs.readFileSync("config/media-publishing/published-narrations.json", "utf8")));
 const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
 const items = discoverAndParseContent().map(normalizeContent).filter(item => item.canonicalId === release.canonicalId);
 assert.equal(items.length, 2);
 assert.equal(release.adr, "ADR-0033");
 assert.equal(release.actualIPhoneAcceptance, "OWNER_REPORTED_PASS");
 assert.equal(release.protectedPreview.ownerAuthenticatedPlayback, "OWNER_REPORTED_PASS");
 assert.equal(release.listeningApproval, "OWNER_APPROVED_BOTH_LANGUAGES");
 for (const item of items) {
  const asset = release.assets.find((row: {locale: string}) => row.locale === item.language);
  const entry = catalog.records.find(row => row.canonicalId === item.canonicalId && row.locale === item.language);
  assert.ok(asset); assert.ok(entry);
  assert.equal(hash(fs.readFileSync(asset.sourcePath)), entry.sourceSha256);
  assert.equal(narrationPresentationHash(item), entry.presentationSha256);
  assert.equal(hash(fs.readFileSync("public" + entry.src)), entry.audioSha256);
  assert.equal(fs.statSync("public" + entry.src).size, asset.bytes);
  assert.equal(hash(JSON.stringify(asset.voice)), entry.voiceConfigSha256);
  assert.deepEqual(resolvePublishedNarration(item), {src: entry.src, audioSha256: entry.audioSha256});
  assert.equal(resolvePublishedNarration({...item, body: item.body + " changed"}), undefined);
 }
});

test("No More Delay release binds owner-accepted bilingual MP3s to unchanged published sermons", () => {
 const release = JSON.parse(fs.readFileSync("config/media-publishing/releases/no-more-delay.json", "utf8"));
 const catalog = validateNarrationCatalog(JSON.parse(fs.readFileSync("config/media-publishing/published-narrations.json", "utf8")));
 const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
 const expected = {
  "zh-CN": {source:"4ff0fde9a6c3a881370e19e9c2cb473dc593e96e91cc8a44dbb905b4308986b0",audio:"396062c2bc5208c04703ab05f9733c19c25f522760308ccb86f8efbac3875dd2",bytes:21006476,profile:"74e455be-7104-48e6-a8d4-7da35e4fa2df",version:1},
  "en-US": {source:"0ea197578992ace6fed5ae0670318b89b0cadaf8c70c7c643a93bef832d47892",audio:"d315feda24fe225a3bc780869e0981487f2c5fe4705212981b0ae8bbfa3c87e4",bytes:24731756,profile:"d8c5508c-ae50-444d-a246-462ab92a7ce5",version:2},
 };
 assert.match(fs.readFileSync("docs/adr/0039-no-more-delay-audio-release.md","utf8"),/^Status: Accepted/m);
 assert.equal(release.canonicalId,"sermon-revelation-10-5-7");
 assert.equal(release.ownerSubject,"paulzhang901-jpg");
 assert.equal(release.listeningApproval,"OWNER_APPROVED_BOTH_LANGUAGES");
 assert.equal(release.actualIPhoneAcceptance,"OWNER_REPORTED_PASS");
 assert.equal(release.protectedPreview.url,"https://2ae07f37.paulzhang-website-preview.pages.dev");
 assert.equal(release.finalHeadApproval.required,true);
 const items=discoverAndParseContent().map(normalizeContent).filter(item=>item.canonicalId===release.canonicalId);
 assert.equal(items.length,2);
 assert.equal(release.assets.length,2);
 assert.equal(catalog.records.filter(row=>row.canonicalId===release.canonicalId).length,2);
 for(const item of items){
  const fixed=expected[item.language];const asset=release.assets.find((a:{locale:string})=>a.locale===item.language);const entry=catalog.records.find(a=>a.canonicalId===item.canonicalId&&a.locale===item.language);
  assert.ok(asset);assert.ok(entry);
  assert.equal(hash(fs.readFileSync(asset.sourcePath)),fixed.source);
  assert.equal(asset.sourceSha256,fixed.source);assert.equal(entry.sourceSha256,fixed.source);
  assert.equal(asset.audioSha256,fixed.audio);assert.equal(entry.audioSha256,fixed.audio);
  assert.equal(entry.voiceProfileId,fixed.profile);assert.equal(entry.narrationVersion,fixed.version);
  assert.equal(entry.publicationEventId,release.id);
  assert.equal(entry.voiceConfigSha256,hash(JSON.stringify(asset.voice,Object.keys(asset.voice).sort())));
  assert.equal(entry.presentationSha256,narrationPresentationHash(item));
  assert.equal(entry.src,`/media/narration/${fixed.audio}.mp3`);
  const file=fs.readFileSync("public"+entry.src);assert.equal(file.length,fixed.bytes);assert.equal(hash(file),fixed.audio);
  assert.equal(asset.bytes,fixed.bytes);
  assert.deepEqual(resolvePublishedNarration(item,catalog),{src:entry.src,audioSha256:fixed.audio});
  assert.equal(resolvePublishedNarration({...item,body:item.body+" changed"},catalog),undefined);
 }
});
