import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createContentRepository } from "../../src/lib/content/repository";
import { getPublishedVideos, standaloneVideoSourceHash, validateVideoCatalog } from "../../src/lib/content/published-videos";
import { videoStaticParams, resolveVideoDetail } from "../../src/components/content/video-detail-page";
import { VideosSection } from "../../src/components/content/videos-section";

const url="https://github.com/paulzhang901-jpg/paulzhang-website/releases/download/sermon-prayer-peace-20261030/695e6cec2906c666727bc937da45ecaa84a4a4bb5f61553bd10196ce6f04aca8.mp4";
const source={canonicalId:"video-sermon-prayer-peace",locale:"zh-CN",sourceKind:"standalone",category:"approved-standalone-videos",videoType:"sermon",title:"祷告之后，为什么仍不平安？",primaryPage:"/videos/peace-after-prayer",mp4:url};
const entry={...source,state:"PUBLISHED",kind:"production",sourceSha256:standaloneVideoSourceHash(source),publishedAt:"2026-10-30T00:00:00Z",publicationEventId:"owner-prayer-peace-direct-20261030"};
const repo=createContentRepository([]);
const catalog=(r:unknown)=>({schemaVersion:1,records:[r]});
test("exact approved original resolves through existing standalone video detail",()=>{
 const videos=getPublishedVideos(repo,"zh-CN",catalog(entry));
 assert.equal(videos.length,1); assert.equal(videos[0].mp4,url);
 assert.equal(videos[0].detail,"/videos/peace-after-prayer");
 assert.deepEqual(videoStaticParams("zh-CN",repo,catalog(entry)),[{slug:"peace-after-prayer"}]);
 assert.deepEqual(getPublishedVideos(repo,"en-US",catalog(entry)),[]);
});
test("no generic external standalone URL, swapped locale or wrong destination is admitted",()=>{
 for(const changed of [{mp4:url.replace('sermon-prayer-peace-20261030','other-tag')},{mp4:'https://www.youtube.com/watch?v=BJK5tloWFUM'},{canonicalId:'other-sermon'},{locale:'en-US'},{primaryPage:'/videos/other'}]) {
  assert.throws(()=>validateVideoCatalog(catalog({...entry,...changed})));
 }
 assert.deepEqual(getPublishedVideos(repo,"zh-CN",catalog({...entry,sourceSha256:'0'.repeat(64)})),[]);
});
test("native player's no-CORS mode is exact, other independent players keep anonymous CORS",()=>{
 const [video]=getPublishedVideos(repo,"zh-CN",catalog(entry));
 const html=renderToStaticMarkup(<VideosSection locale="zh-CN" items={[video]} />);
 assert.match(html,/<video[^>]*controls=""[^>]*playsInline=""/);
 assert.match(html,/GitHub/); assert.match(html,/腓立比书 4:7/);
 assert.doesNotMatch(html,/<iframe|youtube\.com|youtube-nocookie|crossorigin=|AI 合成旁白/);
 assert.match(html,/讲道精华/);
 const other=renderToStaticMarkup(<VideosSection locale="zh-CN" items={[{canonicalId:'other',locale:'zh-CN',title:'Other',mp4:'/test.mp4',poster:'/test.jpg',captions:'/test.vtt',article:'/library/test'}]} />);
 assert.match(other,/crossorigin="anonymous"/);
 const spoofed=renderToStaticMarkup(<VideosSection locale="zh-CN" items={[{...video,mp4:'https://example.com/other.mp4'}]} />);
 assert.match(spoofed,/crossorigin="anonymous"/);
});
test("real runtime catalog includes the Chinese route, approved captions and unchanged direct master",()=>{
 const video=resolveVideoDetail('peace-after-prayer','zh-CN',repo);
 assert.ok(video);assert.equal(video.mp4,url);assert.ok(video.captions);assert.ok(video.srt);
 assert.ok(videoStaticParams('zh-CN',repo).some(v=>v.slug==='peace-after-prayer'));
 assert.equal(resolveVideoDetail('peace-after-prayer','en-US',repo),undefined);
});
