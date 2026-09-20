import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import React from "react";
import {renderToReadableStream} from "react-dom/server";
import {ContentPage} from "../../src/components/content/content-page";
import {LibraryPage} from "../../src/components/content/library-page";
import {SermonPublicationBody} from "../../src/components/content/sermon-publication-page";
import {getContentRepository} from "../../src/lib/content/repository";
import {sameSermonDisplayText, sermonDisplayMarkdown, sermonDisplayText} from "../../src/lib/sermons/display";
import type {ContentLanguage} from "../../src/types/content";

Object.assign(globalThis, {React});
const render = async (element: React.ReactNode) => new Response(await renderToReadableStream(element)).text();

test("sermon presentation preserves source while rendering Markdown structure and display separators", async () => {
  for (const locale of ["zh-CN", "en-US"] as const) {
    const title = locale === "zh-CN" ? "标题------副题" : "Title------Subtitle";
    const body = `# ${title}\n\n## Introduction\n\nFirst paragraph.\n\nSecond paragraph.\n\n### Point\n\n> Scripture quotation\n\n1. First\n2. Second\n\n- Item\n\n**Emphasis**\n\nText------text\n\n[Link](https://example.com/a------b)\n\n\`code------unchanged\``;
    const snapshot = body;
    const html = await render(React.createElement(SermonPublicationBody, {body, title, locale, scriptureRange: "Revelation 6:9–11"}));
    assert.ok(!html.includes("<h1"));
    for (const tag of ["h2", "h3", "p", "blockquote", "ol", "ul", "strong"]) assert.ok(html.includes(`<${tag}`), tag);
    assert.ok(html.includes(locale === "zh-CN" ? "Text——text" : "Text—text"));
    assert.ok(html.includes('href="https://example.com/a------b"'));
    assert.ok(html.includes("code------unchanged"));
    assert.equal(body, snapshot);
  }
  const escaped = "# 标题\n\n正文。 \\##\n引言\n第一段。\n第二段。\n\n\\## 一、第一点";
  const html = await render(React.createElement(SermonPublicationBody, {body: escaped, title: "标题", locale: "zh-CN", scriptureRange: "启示录 6:9–11"}));
  assert.ok(html.includes("<h2>引言</h2>"));
  assert.ok(html.includes("<p>第一段。</p>"));
  assert.ok(html.includes("<p>第二段。</p>"));
  assert.ok(!html.includes("##"));
  const code = "```text\n\\## Not a heading\n```";
  assert.equal(sermonDisplayMarkdown(code, "zh-CN"), code);
  assert.equal(sermonDisplayText("Revelation 6:9–11", "en-US"), "Revelation 6:9–11");
});

test("all published sermon editions share one Hero and retain registered canonical bytes", async () => {
  const repository = await getContentRepository();
  const registry = JSON.parse(fs.readFileSync("config/content/sermons/publication-runtime.json", "utf8"));
  for (const record of registry.records) {
    const locale: ContentLanguage = record.publicRoute.startsWith("/en/") ? "en-US" : "zh-CN";
    const item = repository.getContentBySlug("library", record.publicRoute.split("/").at(-1), locale)!;
    const bytes = fs.readFileSync(record.runtimeContentPath);
    const body = bytes.subarray(bytes.indexOf(Buffer.from("\n---\n"), 4) + 5);
    assert.equal(crypto.createHash("sha256").update(body).digest("hex"), record.canonicalEditionHash, record.sermonId);
    const html = await render(await ContentPage({item, repository}));
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, record.sermonId);
    assert.ok(!html.includes("##"), record.sermonId);
    assert.ok(!html.includes("Website Canonical Edition"), record.sermonId);
    assert.ok(html.includes("<h2"), record.sermonId);
    assert.ok(html.includes("data-language-alternate"), record.sermonId);
    assert.ok(html.includes(locale === "zh-CN" ? "阅读 English Edition" : "Read the Chinese edition"));
    assert.ok(bytes.equals(fs.readFileSync(record.runtimeContentPath)));
  }
});

test("Library suppresses only duplicate sermon secondary text and retains distinct subtitles", async () => {
  const repository = await getContentRepository();
  for (const locale of ["zh-CN", "en-US"] as const) {
    const html = await render(await LibraryPage({locale, repository}));
    const articles = html.match(/<article\b[\s\S]*?<\/article>/g) ?? [];
    for (const item of repository.getPublishedContent(locale).filter((entry) => entry.contentType === "sermon")) {
      const article = articles.find((entry) => entry.includes(`href="${locale === "en-US" ? "/en" : ""}/library/${item.slug}"`));
      assert.ok(article, item.slug);
      assert.equal(article.includes("max-w-3xl"), !sameSermonDisplayText(item.subtitle ?? item.summary, item.title, locale), item.slug);
      assert.ok(!/<h2[^>]*>[\s\S]*?-{3,}[\s\S]*?<\/h2>/.test(article), item.slug);
    }
  }
});
