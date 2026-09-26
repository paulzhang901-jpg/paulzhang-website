import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import {renderToReadableStream} from "react-dom/server";
import {TogetherSectionPage} from "../../src/components/content/together-page";
import {ebooks, ebookCoverUrl, ebookPdfUrl} from "../../src/lib/content/ebooks";
import {createContentRepository} from "../../src/lib/content/repository";

Object.assign(globalThis, {React});
const repository = createContentRepository([]);

for (const locale of ["zh-CN", "en-US"] as const) {
  test(`Together resources display the existing ebooks in volume order (${locale})`, async () => {
    const page = React.createElement(TogetherSectionPage, {locale, section: "resources", repository});
    const html = await new Response(await renderToReadableStream(page)).text();
    const cards = html.match(/<article\b[\s\S]*?<\/article>/g) ?? [];
    assert.equal(cards.length, 3);
    assert.ok(html.includes(locale === "zh-CN"
      ? "《删不掉的光》系列 · 中英文双语 · 免费 PDF 电子书"
      : "The Light They Could Not Erase · Bilingual Chinese–English · Free PDF E-books"));
    assert.ok(!html.includes("这个栏目目前还没有已公开的内容。"));
    assert.ok(!html.includes("No published content is available in this section yet."));
    for (const [index, book] of ebooks.entries()) {
      const card = cards[index];
      assert.ok(card.includes(book.zhTitle));
      assert.ok(card.includes(book.enTitle));
      assert.ok(card.includes(locale === "zh-CN" ? book.zhDescription : book.enDescription));
      assert.ok(card.includes(`src="${ebookCoverUrl(book.volume)}"`));
      assert.ok(card.includes(`href="${ebookPdfUrl(book.volume)}"`));
      assert.ok(card.includes(locale === "zh-CN" ? "免费下载 PDF" : "Download PDF"));
    }
  });
}
