import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { VideosSection, type VideoPresentation } from "../../src/components/content/videos-section";
import { VideosPage } from "../../src/components/content/videos-page";
import { createContentRepository } from "../../src/lib/content/repository";

const item: VideoPresentation = {
  canonicalId: "test-only", locale: "en-US", title: "Test video",
  mp4: "/test-only/video.mp4", poster: "/test-only/poster.jpg",
  captions: "/test-only/captions.vtt", article: "/en/library/test-only",
  audio: "/test-only/audio.mp3",
}; // Render fixtures only; these paths are not catalog entries or hosted assets.
test("listing page preserves primary heading, reading link and genuine empty states alongside approved standalone media", () => {
  for (const locale of ["zh-CN", "en-US"] as const) {
    const html = renderToStaticMarkup(<VideosPage locale={locale} repository={createContentRepository([])} />);
    assert.equal((html.match(/<h1/g) ?? []).length, 1);
    assert.match(html, locale === "zh-CN" ? /目前暂无已发布的视频/ : /No published videos/);
    assert.ok(html.includes(locale === "zh-CN" ? 'href="/library"' : 'href="/en/library"'));
    assert.match(html,locale === "zh-CN" ? /已批准的独立视频/ : /Approved Standalone Videos/);
    assert.ok(html.includes(`href="${locale === "en-US" ? "/en" : ""}/about/profile#pastor-biography-video"`));
  }
});
test("video cards display alternate title, Scripture and actual media publication date", () => {
  const html = renderToStaticMarkup(<VideosSection locale="en-US" items={[{...item, alternateTitle: "中文测试", scriptureRefs: [{book: "Hebrews", chapterStart: 11, verseStart: 1, chapterEnd: 11, verseEnd: 6}], publishedAt: "2026-01-01T12:00:00Z"}]} />);
  assert.match(html, /中文测试/);
  assert.match(html, /Hebrews 11:1–6/);
  assert.match(html, /dateTime="2026-01-01T12:00:00Z"/);
  assert.match(html, /crossorigin="anonymous"/);
});


test("bilingual empty listings do not expose unpublished media", () => {
  assert.match(renderToStaticMarkup(<VideosSection locale="zh-CN" />), /视频讲堂/);
  assert.match(renderToStaticMarkup(<VideosSection locale="en-US" />), /No published videos/);
  assert.doesNotMatch(renderToStaticMarkup(<VideosSection locale="zh-CN" items={[item]} />), /<video/);
});
test("native player provides captions, poster and related reading/audio without autoplay", () => {
  const html = renderToStaticMarkup(<VideosSection locale="en-US" items={[item]} />);
  for (const text of ['<video', 'controls=""', 'playsInline=""', 'preload="none"', 'poster="/test-only/poster.jpg"', 'kind="captions"', 'Read article', 'Listen to audio', 'AI-generated narration']) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /<iframe|autoplay|speechSynthesis/);
});
test("invalid and YouTube sources are excluded", () => {
  for (const mp4 of ["javascript:alert(1)", "//host/video.mp4", "https://youtube.com/video", "https://youtu.be/video"]) {
    assert.doesNotMatch(renderToStaticMarkup(<VideosSection locale="en-US" items={[{...item, mp4}]} />), /<video/);
  }
});

test("ADR-0038 renders a private activation gate and honest fallback, not an iframe or download", () => {
  const video: VideoPresentation = {canonicalId:"sermon-revelation-9-20-21",locale:"zh-CN",title:"仍旧不悔改",
    provider:"youtube",videoId:"0J44f6acTeQ",article:"/library/still-they-did-not-repent"};
  const html = renderToStaticMarkup(<VideosSection locale="zh-CN" items={[video]} />);
  assert.match(html,/加载 YouTube 视频/);
  assert.match(html,/YouTube，并适用其隐私政策/);
  assert.match(html,/未提供经审核的字幕文件/);
  assert.match(html,/watch\?v=0J44f6acTeQ/);
  assert.doesNotMatch(html,/<iframe|<video|youtube-nocookie|下载字幕|打开视频文件/);
  assert.doesNotMatch(renderToStaticMarkup(<VideosSection locale="zh-CN" items={[{...video,canonicalId:"other"}]} />),/加载 YouTube/);
});

test("standalone player uses optional auxiliaries honestly and links to existing biography", () => {
  const video = {...item, canonicalId:"video-pastor-biography-zhang-chongzhu", sourceKind:"standalone" as const, locale:"zh-CN" as const, title:"牧师的旅程", article:"/about/profile#pastor-biography-video", poster:undefined,captions:undefined,audio:undefined};
  const html=renderToStaticMarkup(<VideosSection locale="zh-CN" items={[video]} />);
  assert.match(html, /<video/); assert.match(html, /牧师简介/);
  assert.match(html,/href="\/about\/profile#pastor-biography-video"/);
  assert.doesNotMatch(html, /<track|poster=|AI 合成|下载字幕|收听音频/);
});

test("ADR-0040 renders only the matching bilingual sermon video with localized activation and no third-party preload", () => {
  for (const [locale, videoId] of [["zh-CN","KQ6jdIFjB8c"],["en-US","q8q67bsI3t0"]] as const) {
    const video = {canonicalId:"sermon-revelation-10-5-7",locale,title:"The Day of No More Delay",provider:"youtube" as const,videoId,article:(locale==="en-US"?"/en":"")+"/library/the-day-of-no-more-delay"} as VideoPresentation;
    const html=renderToStaticMarkup(<VideosSection locale={locale} items={[video]} />);
    assert.ok(html.includes("watch?v="+videoId));
    assert.match(html,locale==="en-US"?/Load YouTube video/:/加载 YouTube 视频/);
    assert.doesNotMatch(html,/<iframe|youtube-nocookie|<video|打开视频文件|Download subtitles/);
    const wrong= {...video,videoId:locale==="en-US"?"KQ6jdIFjB8c":"q8q67bsI3t0"} as VideoPresentation;
    assert.doesNotMatch(renderToStaticMarkup(<VideosSection locale={locale} items={[wrong]} />),/watch\?v=/);
  }
});

test("David pair preserves localized activation and captions without third-party preload or crossed-language video", () => {
  for(const [locale,videoId] of [["zh-CN","j4iVhPwUvK8"],["en-US","nlt5tOE2AcE"]] as const){
    const video:VideoPresentation={canonicalId:"bible-study-david-goliath-faith-over-fear",locale,videoId,title:"David and Goliath",provider:"youtube",article:(locale==="en-US"?"/en":"")+"/library/david-and-goliath-faith-over-fear",scriptureRefs:[{book:"1 Samuel",chapterStart:17}]};
    const html=renderToStaticMarkup(<VideosSection locale={locale} items={[video]} />);
    assert.ok(html.includes("watch?v="+videoId));
    assert.match(html,locale==="zh-CN"?/已上传中文字幕/:/English captions have been uploaded/);
    assert.match(html,/1 Samuel 17/);
    assert.doesNotMatch(html,/<iframe|<video|youtube-nocookie|autoplay|Download subtitles|未提供经审核/);
    const wrong={...video,videoId:locale==="zh-CN"?"nlt5tOE2AcE":"j4iVhPwUvK8"} as VideoPresentation;
    assert.doesNotMatch(renderToStaticMarkup(<VideosSection locale={locale} items={[wrong]} />),/watch\?v=/);
  }
});
