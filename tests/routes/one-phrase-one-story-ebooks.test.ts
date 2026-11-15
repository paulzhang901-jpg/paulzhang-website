import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import React from "react";
import {renderToReadableStream} from "react-dom/server";
import {LibraryPage} from "../../src/components/content/library-page";
import {createContentRepository} from "../../src/lib/content/repository";

Object.assign(globalThis, {React});
const repository = createContentRepository([]);
const urls = ["/ebooks/one-phrase-one-story-chinese-author-review.pdf", "/ebooks/one-phrase-one-story-english-author-review.pdf"];
for (const locale of ["zh-CN", "en-US"] as const) {
  test(`Library offers both One Phrase, One Story review editions (${locale})`, async () => {
    const page = await LibraryPage({locale, repository});
    const html = await new Response(await renderToReadableStream(page)).text();
    const section = html.match(/<section[^>]*aria-labelledby="one-phrase-one-story-title"[\s\S]*?<\/section>/)?.[0];
    assert.ok(section, "Book must appear within the existing Library");
    assert.ok(section.includes("一句英语，一个故事"));
    assert.ok(section.includes("One Phrase, One Story"));
    assert.ok(section.includes(locale === "zh-CN" ? "作者审阅版" : "Author review edition"));
    assert.equal((section.match(/<article\b/g) ?? []).length, 2);
    for (const url of urls) {
      assert.equal((section.match(new RegExp(`href="${url}"`, "g")) ?? []).length, 2, "Read and download link must share the exact PDF");
      assert.ok(fs.readFileSync(`public${url}`).subarray(0, 5).equals(Buffer.from("%PDF-")));
    }
    assert.ok(!section.includes(".docx"));
    assert.ok(!section.includes("bilingual.pdf"));
    assert.ok(html.includes("the-light-they-could-not-erase-vol-1.pdf"), "Existing books remain available");
    assert.ok(html.includes("john-textbooks-title"), "Existing catalogue remains available");
  });
}
