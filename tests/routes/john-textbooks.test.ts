import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import React from "react";
import {renderToReadableStream} from "react-dom/server";
import {LibraryPage} from "../../src/components/content/library-page";
import {createContentRepository} from "../../src/lib/content/repository";
Object.assign(globalThis, {React});
for (const locale of ["zh-CN", "en-US"] as const) {
  test(`John textbooks: six existing covers, grouped editions and blocked downloads (${locale})`, async () => {
    const html = await new Response(await renderToReadableStream(await LibraryPage({locale, repository:createContentRepository([])}))).text();
    assert.ok(html.includes('中文版｜Chinese Edition'));
    assert.ok(html.includes('英文版｜English Edition'));
    const cards = html.match(/<article\b[^>]*data-john-book[^>]*>[\s\S]*?<\/article>/g) ?? [];
    assert.equal(cards.length, 6);
    for (const card of cards) {
      assert.match(card, /<button[^>]*disabled/);
      assert.doesNotMatch(card, /href=/);
      const src = card.match(/<img[^>]*src="([^"]+)"/)![1];
      assert.ok(fs.existsSync(`public${src}`));
      assert.match(card.replace(/<!-- -->/g, ""), /PDF · [\d,]+/);
    }
    assert.ok(html.includes('以英语为工具，以圣经为教材，以真理为根基，以生命成长为方向。'));
    assert.ok(html.includes('English as a tool, Scripture as our textbook, truth as our foundation, and spiritual growth as our goal.'));
    assert.ok(html.includes('879'));
    assert.equal((html.match(/href="\/ebooks\/the-light-they-could-not-erase-vol-/g) ?? []).length, 3);
    assert.equal(fs.readdirSync('public/ebooks').filter(x => /john/i.test(x) && /\.pdf$/.test(x)).length, 0);
  });
}
