import assert from "node:assert/strict";
import test from "node:test";
import {getContentRepository} from "../../src/lib/content/repository";
import {loadPublishedSermon} from "../../src/lib/sermons/published";
import {metadataForContent} from "../../src/lib/content/metadata";
import {currentSunday, sundayWeeklyHistory} from "../../src/data/sunday";
import sitemap from "../../src/app/sitemap";

test("November 15 has one Sunday entry linked to complete canonical bilingual sermons", async () => {
  const slug = "two-witnesses-in-the-darkness";
  const canonicalId = "sermon-revelation-11-3-6";
  assert.equal(currentSunday.date, "2026-11-15");
  assert.equal(sundayWeeklyHistory.filter(entry => entry.date === currentSunday.date).length, 1);
  assert.equal(currentSunday.sermonUrl, `/library/${slug}`);
  assert.equal(currentSunday.speakerEn, "Rev. Chongzhu Paul Zhang");
  const repository = await getContentRepository();
  const entries = await sitemap();
  for (const locale of ["zh-CN", "en-US"] as const) {
    const item = repository.getContentBySlug("library", slug, locale)!;
    assert.ok(item);
    assert.equal(item.canonicalId, canonicalId);
    assert.equal(item.contentType, "sermon");
    const sermon = loadPublishedSermon(item.id, locale)!;
    assert.ok(sermon);
    assert.equal(sermon.body.trim(), item.body.trim());
    assert.equal(sermon.body.match(/^## /gm)?.length, 7);
    assert.match(sermon.scriptureRange, /11:3–6/);
    assert.ok(sermon.body.includes(locale === "zh-CN" ? "2026年11月15日" : "November 15, 2026"));
    assert.ok(sermon.body.trim().endsWith(locale === "zh-CN" ? "阿们。" : "Amen."));
    assert.ok(repository.resolvePublicTranslation(canonicalId, locale === "zh-CN" ? "en-US" : "zh-CN", item).available);
    assert.ok(repository.getSearchDocuments(locale).some(entry => entry.id === item.id));
    const url = `https://paulzhang.org${locale === "en-US" ? "/en" : ""}/library/${slug}`;
    const metadata = metadataForContent(item, repository);
    assert.equal(String(metadata.alternates?.canonical), url);
    assert.equal(entries.filter(entry => entry.url === url).length, 1);
  }
  assert.equal(repository.getContentByCanonicalId(canonicalId).length, 2);
});
