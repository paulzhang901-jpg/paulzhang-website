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
test("listing page has one primary heading, reading link and genuine empty state in both locales", () => {
  for (const locale of ["zh-CN", "en-US"] as const) {
    const html = renderToStaticMarkup(<VideosPage locale={locale} repository={createContentRepository([])} />);
    assert.equal((html.match(/<h1/g) ?? []).length, 1);
    assert.match(html, locale === "zh-CN" ? /目前暂无已发布的视频/ : /No published videos/);
    assert.ok(html.includes(locale === "zh-CN" ? 'href="/library"' : 'href="/en/library"'));
    assert.doesNotMatch(html, /<video|<iframe/);
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
