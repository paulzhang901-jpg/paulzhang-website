import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import matter from "gray-matter";
import {getContentRepository, createContentRepository} from "../../src/lib/content/repository";
import {getPublishedVideos, videoSourceHash, validateVideoCatalog} from "../../src/lib/content/published-videos";
import {resolvePublishedNarration, narrationPresentationHash, validateNarrationCatalog} from "../../src/lib/content/published-narrations";
import {videoStaticParams, resolveVideoDetail} from "../../src/components/content/video-detail-page";
const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const read = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));

test("ADR-0036 binds exact approved bilingual bodies and media to the immutable source snapshot", async () => {
  const r = read("config/media-publishing/releases/what-is-true-faith.json");
  const original = fs.readFileSync("config/media-publishing/releases/what-is-true-faith-production-candidate.json");
  assert.equal(hash(original), "67d156a69cd95234a492041959b6a146e4b688711b6e9c0548ecf8a08e1fc630");
  const approved = JSON.parse(original.toString());
  assert.equal(r.canonicalId, "article-what-is-true-faith");
  assert.equal(r.adr, "ADR-0036");
  assert.match(r.sourceCommit, /^[a-f0-9]{40}$/);
  assert.equal(r.sourceCommit, "7e8b8e03838d8f07d483918972c01374b4b6586e");
  assert.equal(r.id, "owner-true-faith-20261019");
  assert.equal(r.assets.length, 12);
  const audio = validateNarrationCatalog(read("config/media-publishing/published-narrations.json"));
  const video = validateVideoCatalog(read("config/media-publishing/published-videos.json"));
  assert.equal(audio.records.filter(e => e.canonicalId === r.canonicalId).length, 2);
  assert.equal(video.records.filter(e => e.canonicalId === r.canonicalId).length, 2);
  const repo = await getContentRepository();
  assert.deepEqual(r.sources.map((s: {locale: string}) => s.locale).sort(), ["en-US", "zh-CN"]);
  for (const s of r.sources) {
    const body = approved.sources.find((e: {locale: string}) => e.locale === s.locale);
    assert.ok(body);
    const raw = fs.readFileSync(s.path);
    assert.equal(hash(matter(raw.toString()).content), body.approvedBodySha256);
    assert.equal(hash(raw), s.sourceSha256);
    // Works in shallow CI too: the release tree must retain the snapshot bytes.
    assert.equal(hash(execFileSync("git", ["show", "HEAD:" + s.path])), s.sourceSha256);
    const item = repo.getContentByCanonicalId(r.canonicalId, s.locale)[0];
    assert.ok(item);
    assert.equal(item.status, "published");
    const a = audio.records.find(e => e.canonicalId === r.canonicalId && e.locale === s.locale);
    const v = video.records.find(e => e.canonicalId === r.canonicalId && e.locale === s.locale);
    assert.ok(a); assert.ok(v);
    assert.equal(a.sourceSha256, s.sourceSha256);
    assert.equal(a.presentationSha256, narrationPresentationHash(item));
    assert.equal(v.sourceSha256, videoSourceHash(item));
    assert.equal(a.publicationEventId, r.id);
    assert.equal(v.publicationEventId, r.id);
    assert.equal(a.voiceProfileId, body.voiceProfileId);
    assert.equal(a.voiceConfigSha256, hash(JSON.stringify(s.legacyVoiceDescriptor)));
    assert.equal(s.legacyVoiceDescriptor.fullHistoricalParametersReconstructed, false);
    assert.equal(s.legacyVoiceDescriptor.profileId, body.voiceProfileId);
    assert.equal(s.historicalGenerationConfigurationSha256, null);
    const short = s.locale === "zh-CN" ? "zh" : "en";
    const expected = (ext: string) => approved.assets.find((e: {file: string}) => e.file === "what-is-true-faith." + short + "." + ext);
    assert.equal(a.src, expected("mp3").proposedPublicPath);
    assert.equal(a.audioSha256, expected("mp3").sha256);
  assert.ok("mp4" in v);
    assert.equal(v.mp4, expected("mp4").proposedPublicPath);
    assert.equal(v.poster, expected("poster.png").proposedPublicPath);
    assert.equal(v.captions, expected("vtt").proposedPublicPath);
    assert.equal(v.srt, expected("srt").proposedPublicPath);
    assert.equal(getPublishedVideos(repo, s.locale).find(entry => entry.canonicalId === r.canonicalId)?.audio, a.src);
    assert.ok(resolveVideoDetail("what-is-true-faith", s.locale, repo));
    assert.ok(videoStaticParams(s.locale, repo).some(e => e.slug === "what-is-true-faith"));
    assert.deepEqual(resolvePublishedNarration(item), {src:a.src, audioSha256:a.audioSha256});
    for (const patch of [{body:item.body + " changed"}, {status:"draft"}, {visibility:"private"}, {accessLevel:"member"}] as const) {
      assert.equal(resolvePublishedNarration({...item, ...patch}), undefined);
      assert.deepEqual(getPublishedVideos(createContentRepository([{...item, ...patch}]), s.locale), []);
    }
  }
  let total = 0;
  for (const a of r.assets) {
    const expected = approved.assets.find((e: {file: string}) => e.file === a.file);
    assert.ok(expected);
    assert.equal(a.sha256, expected.sha256);
    assert.equal(a.bytes, expected.bytes);
    assert.equal(a.publicPath, expected.proposedPublicPath);
    if (!a.publicPath) continue;
    const raw = fs.readFileSync("public" + a.publicPath);
    assert.equal(hash(raw), expected.sha256);
    assert.equal(raw.length, expected.bytes);
    total += raw.length;
  }
  assert.equal(total, 39408920);
});
test("historical preparation stays unauthorized and fixture events never enter release catalogs", () => {
  const old = read("config/media-publishing/releases/what-is-true-faith-preparation.json");
  assert.equal(old.publicationAuthorized, false);
  assert.equal(old.publishedAt, null);
  for (const name of ["published-narrations", "published-videos"]) {
    for (const row of read("config/media-publishing/" + name + ".json").records) {
      if (row.canonicalId !== old.canonicalId) continue;
      assert.equal(row.publicationEventId, "owner-true-faith-20261019");
      assert.doesNotMatch(JSON.stringify(row), /LOCAL-PREVIEW|test-only|fixture|mobile-test\.paulzhang/);
    }
  }
});

