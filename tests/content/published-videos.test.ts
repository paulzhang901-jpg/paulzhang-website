import assert from "node:assert/strict";
import test from "node:test";
import { createContentRepository } from "../../src/lib/content/repository";
import { item } from "./fixtures";
import { getPublishedVideos, videoSourceHash, validateVideoCatalog } from "../../src/lib/content/published-videos";
import { metadataForRoute } from "../../src/lib/seo/metadata";
import { localizedPath, routes, resolveEnglishSegments } from "../../src/lib/i18n/routing";

const zh = item({title: "测试中文", scriptureRefs: [{book: "Hebrews", chapterStart: 11, verseStart: 1, chapterEnd: 11, verseEnd: 6}]});
const en = item({id: "en", title: "English test", language: "en-US", slug: "english-test"});
const record = {canonicalId: zh.canonicalId, locale: "zh-CN", state: "PUBLISHED", kind: "production",
  sourceSha256: videoSourceHash(zh), mp4: "/test-only/video.mp4", poster: "/test-only/poster.jpg",
  captions: "/test-only/captions.vtt", publishedAt: "2026-01-01T12:00:00Z", publicationEventId: "test-only-not-a-release"};
const catalog = (...records: unknown[]) => ({schemaVersion: 1, records});

test("video discovery resolves canonical metadata, translations and article path; no fabricated audio", () => {
  const videos = getPublishedVideos(createContentRepository([zh, en]), "zh-CN", catalog(record));
  assert.equal(videos.length, 1);
  assert.equal(videos[0].title, zh.title);
  assert.equal(videos[0].alternateTitle, en.title);
  assert.equal(videos[0].article, "/library/sample");
  assert.deepEqual(videos[0].scriptureRefs, zh.scriptureRefs);
  assert.equal(videos[0].publishedAt, record.publishedAt);
  assert.equal(videos[0].audio, undefined);
});
test("empty, missing, stale, wrong-locale, future and non-public sources do not appear", () => {
  const repository = createContentRepository([zh]);
  assert.deepEqual(getPublishedVideos(repository, "zh-CN"), []);
  assert.deepEqual(getPublishedVideos(repository, "en-US", catalog(record)), []);
  assert.deepEqual(getPublishedVideos(repository, "zh-CN", catalog({...record, canonicalId: "missing"})), []);
  assert.deepEqual(getPublishedVideos(repository, "zh-CN", catalog({...record, sourceSha256: "0".repeat(64)})), []);
  assert.deepEqual(getPublishedVideos(repository, "zh-CN", catalog({...record, publishedAt: "2999-01-01T00:00:00Z"})), []);
  for (const patch of [{status: "draft"}, {visibility: "private"}, {accessLevel: "member"}] as const) {
    assert.deepEqual(getPublishedVideos(createContentRepository([item(patch)]), "zh-CN", catalog(record)), []);
  }
});
test("catalog rejects duplicate identity, unsafe/YouTube media and non-release entries", () => {
  assert.throws(() => validateVideoCatalog(catalog(record, record)));
  for (const mp4 of ["https://youtube.com/watch?v=test", "https://youtu.be/test", "//host/video.mp4", "javascript:alert(1)"]) {
    assert.throws(() => validateVideoCatalog(catalog({...record, mp4})));
  }
  for (const patch of [{state: "DRAFT"}, {kind: "mock"}, {title: "duplicate editorial title"}]) {
    assert.throws(() => validateVideoCatalog(catalog({...record, ...patch})));
  }
});
test("video routes expose bilingual navigation and self canonical / hreflang", () => {
  assert.equal(routes.find(route => route.id === "videos")?.navigation, true);
  assert.equal(localizedPath("videos", "zh-CN"), "/videos");
  assert.equal(localizedPath("videos", "en-US"), "/en/videos");
  assert.equal(resolveEnglishSegments(["videos"]), "videos");
  for (const locale of ["zh-CN", "en-US"] as const) {
    const metadata = metadataForRoute("videos", locale);
    assert.equal(metadata.alternates?.canonical, "https://paulzhang.org" + localizedPath("videos", locale));
    assert.deepEqual(metadata.alternates?.languages, {"zh-CN": "https://paulzhang.org/videos", "en-US": "https://paulzhang.org/en/videos"});
  }
});

test("ADR-0038 accepts only the exact Chinese sermon YouTube identity", () => {
  const approved = {canonicalId:"sermon-revelation-9-20-21",locale:"zh-CN",state:"PUBLISHED",kind:"production",
    sourceSha256:"a".repeat(64),provider:"youtube",videoId:"0J44f6acTeQ",channelId:"UCij02113c9lnl5oZeRKbE6Q",
    publishedAt:"2026-10-20T00:00:00Z",publicationEventId:"owner-still-unrepentant-youtube-20261020"};
  assert.equal(validateVideoCatalog(catalog(approved)).records.length, 1);
  for (const patch of [{videoId:"wrong"},{channelId:"wrong"},{locale:"en-US"},{canonicalId:"other"},{mp4:"https://youtube.com/watch?v=0J44f6acTeQ"}]) {
    assert.throws(() => validateVideoCatalog(catalog({...approved,...patch})));
  }
});

test("bilingual personal testimony/biography references remain exact and do not invent articles, dates or languages", () => {
  const acceptance={previewUrl:"https://test.paulzhang-website-preview.pages.dev/en/videos/this-is-my-story",
    recordedAt:"2026-01-01T00:00:00Z",evidence:"TEST ONLY acceptance fixture, not a real approval"};
  const hymn={referenceId:"official-paul-zhang-testimony",locale:"en-US",provider:"youtube",videoId:"PkAcmwSGzkE",
    channelId:"UCij02113c9lnl5oZeRKbE6Q",state:"PUBLISHED",kind:"production",ownerAcceptance:acceptance};
  const repo=createContentRepository([]);
  const videos=getPublishedVideos(repo,"en-US",catalog(hymn));
  assert.equal(videos.length,1);
  assert.equal(videos[0].detail,"/en/videos/this-is-my-story");
  assert.equal(videos[0].article,undefined);
  assert.equal(videos[0].publishedAt,undefined);
  assert.equal(videos[0].scriptureRefs,undefined);
  assert.deepEqual(getPublishedVideos(repo,"zh-CN",catalog(hymn)),[]);
  for(const patch of [{videoId:"other"},{locale:"zh-CN"},{referenceId:"other"},{channelId:"other"},{ownerAcceptance:undefined},{canonicalId:"invented"}])
    assert.throws(()=>validateVideoCatalog(catalog({...hymn,...patch})));
});

test("owner-corrected biography videos resolve as a bilingual testimony pair", () => {
 const acceptance={previewUrl:"https://test.paulzhang-website-preview.pages.dev/videos/paul-zhang-biography",
 recordedAt:"2026-01-01T00:00:00Z",evidence:"TEST ONLY fixture, not real owner acceptance"};
 const base={provider:"youtube",channelId:"UCij02113c9lnl5oZeRKbE6Q",state:"PUBLISHED",kind:"production",ownerAcceptance:acceptance};
 const data=catalog({...base,referenceId:"official-paul-zhang-testimony",locale:"en-US",videoId:"PkAcmwSGzkE"},
 {...base,referenceId:"official-paul-zhang-biography",locale:"zh-CN",videoId:"RPMMeUapK-E"});
 const repo=createContentRepository([]);
 const en=getPublishedVideos(repo,"en-US",data)[0],zh=getPublishedVideos(repo,"zh-CN",data)[0];
 assert.equal(en.pairId,zh.pairId);
 assert.equal(en.category,"Personal Testimony / Biography");
 assert.equal(zh.category,"个人见证／履历简介");
 assert.equal(en.alternateTitle,zh.title);
 assert.equal(zh.alternateTitle,en.title);
 assert.equal(en.related,"/en/about/profile");
 assert.equal(zh.related,"/about/profile");
 assert.equal(en.article,undefined);
 assert.equal(zh.article,undefined);
});
