import test from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {AiAudioPlayer} from "../../src/components/content/ai-audio-player";

test("AI player exposes one MP3, a download link, seeking and speed without autoplay", () => {
 const src="/media/narration/"+"b".repeat(64)+".mp3";
 const html=renderToStaticMarkup(createElement(AiAudioPlayer,{src,title:"Approved sermon"}));
 assert.match(html,new RegExp('href="'+src+'" download=""'));
 assert.equal((html.match(/<audio /g)||[]).length,1);
 assert.match(html,/type="range"/);
 assert.match(html,/<select /);
 assert.doesNotMatch(html,/autoplay/i);
});

test("each locale renders one AI engine and never a browser reader beside it", async () => {
 const {ArticleNarration}=await import("../../src/components/content/article-narration");
 for (const [locale,hash,label] of [["zh-CN","a","下载 MP3"],["en-US","b","Download MP3"]] as const) {
  const src="/media/narration/"+hash.repeat(64)+".mp3";
  const html=renderToStaticMarkup(createElement(ArticleNarration,{locale,title:"Approved sermon",contentId:"body",narration:{src,audioSha256:hash.repeat(64)}}));
  assert.equal((html.match(/<audio /g)||[]).length,1);
  assert.equal((html.match(/download=""/g)||[]).length,1);
  assert.ok(html.includes(src)); assert.ok(html.includes(label));
  assert.doesNotMatch(html,/Read Aloud|朗读文章/);
 }
 const fallback=renderToStaticMarkup(createElement(ArticleNarration,{locale:"en-US",title:"Article",contentId:"body"}));
 // Browser support is discovered after hydration, preserving the legacy SSR behavior.
 assert.doesNotMatch(fallback,/<audio |download=""/);
});
