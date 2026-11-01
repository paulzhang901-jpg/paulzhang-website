import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import {getContentRepository} from "../../src/lib/content/repository";
import {loadPublishedSermon} from "../../src/lib/sermons/published";
import {metadataForContent} from "../../src/lib/content/metadata";
import {resolveLibrarySlug} from "../../src/lib/routing/resolvers";
import {parseCanonicalReaderBody} from "../../src/components/content/sermon-preview-presentation";
import sitemap from "../../src/app/sitemap";

test("November 1 sermon materializes both complete locales through the governed runtime", async () => {
  const repository = await getContentRepository();
  const canonicalId = "sermon-revelation-10-8-11";
  const slug = "sweet-in-the-mouth-bitter-in-the-stomach";
  for (const locale of ["zh-CN", "en-US"] as const) {
    const item = repository.getContentBySlug("library", slug, locale)!;
    assert.equal(item.canonicalId, canonicalId);
    const sermon = loadPublishedSermon(item.id, locale)!;
    assert.ok(sermon);
    assert.equal(sermon.body.trim(), item.body.trim());
    assert.match(sermon.sermonSeries, /10|十/);
    assert.match(sermon.scriptureRange, /10:8–11/);
    assert.ok(repository.resolvePublicTranslation(canonicalId, locale === "zh-CN" ? "en-US" : "zh-CN", item).available);
    assert.ok(sermon.body.includes(locale === "zh-CN" ? "## 结束祷告" : "## Closing Prayer"));
    assert.ok(sermon.body.trim().endsWith(locale === "zh-CN" ? "阿们。" : "Amen."));
  }
});

test("approved Chinese sermon is byte-identical and uses existing Library/search/sitemap; no protected publication", async () => {
  const id = "sermon-p7c-029-001";
  const url = "https://paulzhang.org/library/tanqin-de-shaonian";
  const sermon = loadPublishedSermon(id)!;
  assert.equal(sermon.title, "弹琴的少年");
  assert.equal(crypto.createHash("sha256").update(sermon.body).digest("hex"), "119a795b237de64b2adbc4e0834e72fc8e31e4a31ef39a50ce68af657431e648");
  assert.equal(Buffer.byteLength(sermon.body), 15014);
  const reader = parseCanonicalReaderBody(sermon.body);
  assert.equal(reader[0], "经文");
  assert.ok(reader.includes("引言"));
  assert.ok(!reader.some((line) => line.includes("Website Canonical Edition")));
  assert.equal(loadPublishedSermon("unapproved"), null);
  const repository = await getContentRepository();
  const item = repository.getContentBySlug("library", "tanqin-de-shaonian", "zh-CN")!;
  assert.equal(item.id, id);
  assert.equal(resolveLibrarySlug(item.slug, "zh-CN", repository).kind, "content");
  assert.ok(repository.getPublishedContent("zh-CN").some((entry) => entry.id === id));
  assert.equal(repository.getContentBySlug("library", item.slug, "en-US")?.canonicalId, id);
  const search = repository.getSearchDocuments("zh-CN").find((entry) => entry.id === id)!;
  assert.equal(search.title, sermon.title);
  assert.ok(!search.plain_text_excerpt.includes("Website Canonical Edition"));
  assert.equal(String(metadataForContent(item, repository).alternates?.canonical), url);
  const entries = await sitemap();
  assert.equal(entries.filter((entry) => entry.url === url).length, 1);
  assert.ok(!entries.some((entry) => entry.url.includes("__preview")));
});

test("approved English sermons retain source hash linkage and public bilingual discovery", async () => {
  const repository = await getContentRepository();
  const entries = await sitemap();
  for (const [slug, sourceId] of Object.entries({"tanqin-de-shaonian": "sermon-p7c-029-001", "god-seals-his-people": "sermon-p7c-010-001", "wanguo-da-jingbai": "sermon-p7c-027-001", "chenshui-de-shaonian": "sermon-p7c-028-001"})) {
    const id = `${sourceId}-en`;
    const sermon = loadPublishedSermon(id, "en-US")!;
    assert.ok(sermon.body.length > 10000);
    assert.ok(!sermon.body.includes("Website Canonical Edition"));
    const item = repository.getContentBySlug("library", slug, "en-US")!;
    assert.equal(item.id, id);
    assert.equal(item.canonicalId, sourceId);
    assert.equal(resolveLibrarySlug(slug, "en-US", repository).kind, "content");
    assert.ok(repository.getSearchDocuments("en-US").some((entry) => entry.id === id));
    const url = `https://paulzhang.org/en/library/${slug}`;
    assert.equal(String(metadataForContent(item, repository).alternates?.canonical), url);
    assert.equal(entries.filter((entry) => entry.url === url).length, 1);
    assert.ok(loadPublishedSermon(sourceId));
  }
  assert.equal(loadPublishedSermon("unapproved", "en-US"), null);
});
