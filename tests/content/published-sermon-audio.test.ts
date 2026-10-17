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
