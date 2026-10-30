import assert from "node:assert/strict";
import test from "node:test";
import { getContentRepository, createContentRepository } from "../../src/lib/content/repository";
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
  assert.deepEqual(getPublishedVideos(repository, "zh-CN", catalog()), []);
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

test("English pastor biography uses existing locale-scoped standalone lookup and preserves Chinese binding", async () => {
  const {standaloneVideoSourceHash}=await import("../../src/lib/content/published-videos");
  const {default:current}=await import("../../config/media-publishing/published-videos.json");
  const canonicalId="video-pastor-biography-zhang-chongzhu";
  const source={canonicalId,locale:"en-US",sourceKind:"standalone",category:"approved-standalone-videos",videoType:"biography",title:"The Conviction of Pastor Zhang",primaryPage:"/en/about/profile#pastor-biography-video",mp4:"/media/video/4d7a88bf6e5e97db81e20e0b8979d2f5bd47fc1ced274dbeeb2dc8b47d85cd26.mp4"};
  const fixture={...source,state:"PUBLISHED",kind:"production",sourceSha256:standaloneVideoSourceHash(source),publishedAt:"2020-01-01T00:00:00Z",publicationEventId:"fixture-english-biography-not-production"};
  const repo=createContentRepository([]);
  const input=catalog(...current.records.filter(v=>v.locale!=="en-US" || v.canonicalId!==canonicalId),fixture);
  const zhBefore=getPublishedVideos(repo,"zh-CN",current);
  assert.deepEqual(getPublishedVideos(repo,"zh-CN",input),zhBefore);
  const en=getPublishedVideos(repo,"en-US",input).find(v=>v.canonicalId===canonicalId)!;
  assert.equal(en.title,source.title);assert.equal(en.article,source.primaryPage);assert.equal(en.mp4,source.mp4);
  assert.equal(en.captions,undefined);assert.equal(en.audio,undefined);assert.equal(en.alternateTitle,undefined);
  assert.ok(!getPublishedVideos(repo,"zh-CN",input).some(v=>v.mp4===source.mp4));
});

 test("reading notes use existing detail route and reject unrelated standalone destinations", async()=>{
 const {standaloneVideoSourceHash}=await import("../../src/lib/content/published-videos");
 const {videoStaticParams}=await import("../../src/components/content/video-detail-page");
 const source={canonicalId:"video-reading-notes-anti-empire",locale:"zh-CN",sourceKind:"standalone",category:"approved-standalone-videos",videoType:"reading-notes",title:"一个反帝国的共同体：重塑信仰与政治",primaryPage:"/videos/anti-empire-community",mp4:"/media/video/"+"a".repeat(64)+".mp4"};
 const entry={...source,state:"PUBLISHED",kind:"production",sourceSha256:standaloneVideoSourceHash(source),publishedAt:"2020-01-01T00:00:00Z",publicationEventId:"fixture-reading-notes"};
 const repo=createContentRepository([]);const input=catalog(entry);
 assert.equal(getPublishedVideos(repo,"zh-CN",input)[0].detail,source.primaryPage);
 assert.deepEqual(videoStaticParams("zh-CN",repo,input),[{slug:"anti-empire-community"}]);
 assert.deepEqual(getPublishedVideos(repo,"en-US",input),[]);
 for(const patch of [{primaryPage:"/about/profile#reading"},{primaryPage:"/en/videos/anti-empire-community"},{primaryPage:"/videos/../about"},{videoType:"biography"}])assert.throws(()=>validateVideoCatalog(catalog({...entry,...patch})));
 });

test("reading notes cannot replace an existing article-video detail destination", async()=>{
 const {standaloneVideoSourceHash}=await import("../../src/lib/content/published-videos");
 const source={canonicalId:"video-reading-notes-collision",locale:"zh-CN",sourceKind:"standalone",category:"approved-standalone-videos",videoType:"reading-notes",title:"Collision fixture",primaryPage:"/videos/sample",mp4:"/media/video/"+"b".repeat(64)+".mp4"};
 const entry={...source,state:"PUBLISHED",kind:"production",sourceSha256:standaloneVideoSourceHash(source),publishedAt:"2020-01-01T00:00:00Z",publicationEventId:"fixture-collision"};
 assert.throws(()=>getPublishedVideos(createContentRepository([zh]),"zh-CN",catalog(record,entry)),/Duplicate video detail destination/);
});

test("ADR-0040 catalog accepts exact bilingual tuples and rejects crossed locales, channels and IDs", () => {
  for(const [locale,videoId] of [["zh-CN","KQ6jdIFjB8c"],["en-US","q8q67bsI3t0"]]){
    const r={canonicalId:"sermon-revelation-10-5-7",locale,videoId,provider:"youtube",channelId:"UCij02113c9lnl5oZeRKbE6Q",sourceSha256:"a".repeat(64),state:"PUBLISHED",kind:"production",publishedAt:"2026-10-27T00:00:00Z",publicationEventId:"owner-no-more-delay-youtube-20261027"};
    assert.equal(validateVideoCatalog(catalog(r)).records.length,1);
    for(const patch of [{locale:locale==="zh-CN"?"en-US":"zh-CN"},{channelId:"wrong"},{videoId:"arbitrary"},{canonicalId:"other"},{publicationEventId:"other"}])assert.throws(()=>validateVideoCatalog(catalog({...r,...patch})));
  }
});

test("David and Goliath resolves each exact language, scripture and counterpart; stale/crossed bindings fail closed", () => {
  const canonicalId="bible-study-david-goliath-faith-over-fear";
  const pair = (["zh-CN","en-US"] as const).map(language=>item({id:canonicalId+language,canonicalId,language,slug:"david-and-goliath-faith-over-fear",title:language==="zh-CN"?"大卫与歌利亚：信心胜过恐惧":"David and Goliath: Faith Over Fear",scriptureRefs:[{book:"1 Samuel",chapterStart:17}]}));
  const records=pair.map(source=>({canonicalId,locale:source.language,state:"PUBLISHED",kind:"production",sourceSha256:videoSourceHash(source),provider:"youtube",videoId:source.language==="zh-CN"?"j4iVhPwUvK8":"nlt5tOE2AcE",channelId:"UCij02113c9lnl5oZeRKbE6Q",publishedAt:"2026-10-29T00:00:00Z",publicationEventId:"owner-david-goliath-youtube-20261029"}));
  const repository=createContentRepository(pair);
  for(const r of records){
    const videos=getPublishedVideos(repository,r.locale,catalog(...records));
    assert.equal(videos.length,1);
    assert.equal(videos[0].videoId,r.videoId);
    assert.equal(videos[0].article,(r.locale==="en-US"?"/en":"")+"/library/david-and-goliath-faith-over-fear");
    assert.deepEqual(videos[0].scriptureRefs,[{book:"1 Samuel",chapterStart:17}]);
    assert.equal(videos[0].alternateTitle,pair.find(i=>i.language!==r.locale)?.title);
    assert.deepEqual(getPublishedVideos(repository,r.locale,catalog({...r,sourceSha256:"0".repeat(64)})),[]);
    for(const patch of [{locale:r.locale==="zh-CN"?"en-US":"zh-CN"},{videoId:"arbitrary"},{channelId:"wrong"},{publicationEventId:"other"}])assert.throws(()=>validateVideoCatalog(catalog({...r,...patch})));
  }
});


test("production discovery exposes both David study readers and locale-matched videos through the real catalog", async () => {
  const repository = await getContentRepository();
  const canonicalId = "bible-study-david-goliath-faith-over-fear";
  for (const [locale, videoId] of [["zh-CN", "j4iVhPwUvK8"], ["en-US", "nlt5tOE2AcE"]] as const) {
    const sources = repository.getContentByCanonicalId(canonicalId, locale);
    assert.equal(sources.length, 1, `${locale}: the study must be public, not draft`);
    const video = getPublishedVideos(repository, locale).find(entry => entry.canonicalId === canonicalId);
    assert.ok(video, `${locale}: the production catalog must register the video`);
    assert.equal(video.videoId, videoId);
    const prefix = locale === "en-US" ? "/en" : "";
    assert.equal(video.article, prefix + "/library/david-and-goliath-faith-over-fear");
    assert.equal(video.detail, prefix + "/videos/david-and-goliath-faith-over-fear");
    assert.equal(repository.resolvePublicTranslation(canonicalId, locale === "zh-CN" ? "en-US" : "zh-CN", sources[0]).available, true);
  }
});
