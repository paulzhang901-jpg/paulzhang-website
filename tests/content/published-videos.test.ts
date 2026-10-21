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

test("standalone Chinese biography resolves without a fabricated article, translation or audio", async () => {
  const {standaloneVideoSourceHash} = await import("../../src/lib/content/published-videos");
  const metadata = {sourceKind:"standalone", canonicalId:"video-pastor-biography-zhang-chongzhu",locale:"zh-CN",category:"approved-standalone-videos",videoType:"biography",title:"一位牧师的旅程：张崇助的故事",primaryPage:"/about/profile#pastor-biography-video",mp4:"/media/video/"+"a".repeat(64)+".mp4"};
  const entry = {...metadata,state:"PUBLISHED",kind:"production",sourceSha256:standaloneVideoSourceHash(metadata),publishedAt:"2026-01-01T00:00:00Z",publicationEventId:"fixture-only"};
  const repo=createContentRepository([]);
  const videos=getPublishedVideos(repo,"zh-CN",catalog(entry));
  const {videoStaticParams} = await import("../../src/components/content/video-detail-page");
  assert.deepEqual(videoStaticParams("zh-CN",repo,catalog(entry)),[{slug:"__static-export-placeholder__"}]);
  assert.throws(()=>validateVideoCatalog(catalog(entry,{...entry,canonicalId:"second-video"})),/Duplicate standalone presentation/);
  const enEntry={...entry,locale:"en-US",primaryPage:"/en/about/profile#testimony-video",videoType:"testimony"};
  enEntry.sourceSha256=standaloneVideoSourceHash(enEntry);
  assert.equal(getPublishedVideos(repo,"en-US",catalog(enEntry))[0].article,"/en/about/profile#testimony-video");
  assert.equal(videos.length,1); assert.equal(videos[0].title,metadata.title);
  assert.equal(videos[0].article,metadata.primaryPage);
  assert.equal(videos[0].audio,undefined); assert.equal(videos[0].alternateTitle,undefined);
  assert.deepEqual(getPublishedVideos(repo,"en-US",catalog(entry)),[]);
  assert.deepEqual(getPublishedVideos(repo,"zh-CN",catalog({...entry,title:"changed"})),[]);
  for(const patch of [{videoType:"film"},{category:"other"},{primaryPage:"//evil.example"},{mp4:"https://example.org/a.mp4"},{approved:true}]) assert.throws(()=>validateVideoCatalog(catalog({...entry,...patch})));
});
