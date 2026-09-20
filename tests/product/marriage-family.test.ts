import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import crypto from "node:crypto";
import {createContentRepository, getContentRepository} from "../../src/lib/content/repository";
import {getActiveLibraryCollections, getLibraryCollectionItems, getLibraryItems} from "../../src/lib/content/library";
import {contentPath} from "../../src/lib/content/paths";
import {metadataForContent} from "../../src/lib/content/metadata";
import {libraryTopicLabel, contentTopicLabel} from "../../src/config/library";
import {item} from "../content/fixtures";

const slug = "its-hard-out-here-for-a-husband";
const provenance = JSON.parse(fs.readFileSync(`artifacts/content/${slug}/provenance.json`, "utf8"));
const hash = (text: string) => crypto.createHash("sha256").update(text).digest("hex");
const body = (locale: string) => fs.readFileSync(`content/${locale}/library/${slug}.md`, "utf8").split("---\n").slice(2).join("---\n");

test("paired marriage articles are discoverable with reciprocal public translation and SEO", async () => {
  const repository = await getContentRepository();
  const pair = repository.getContentByCanonicalId(slug);
  assert.equal(pair.length, 2);
  for (const article of pair) {
    assert.equal(article.contentType, "article");
    assert.deepEqual(article.topics, ["marriage", "family"]);
    assert.deepEqual(article.authors, [article.language === "zh-CN" ? "牧长客" : "Paul Zhang"]);
    assert.ok(getLibraryCollectionItems(repository, article.language, "marriage").some((entry) => entry.id === article.id));
    assert.ok(getLibraryCollectionItems(repository, article.language, "family").some((entry) => entry.id === article.id));
    assert.ok(!getLibraryCollectionItems(repository, article.language, "work-money").some((entry) => entry.id === article.id));
    assert.deepEqual(getActiveLibraryCollections(getLibraryItems(repository, article.language)), ["bible", "gospel", "theology", "formation", "marriage", "life-values", "work-money", "church"]);
    const other = repository.resolvePublicTranslation(slug, article.language === "zh-CN" ? "en-US" : "zh-CN", article);
    assert.equal(other.available, true);
    assert.equal(other.status, "published");
    assert.equal(contentPath(article), `${article.language === "en-US" ? "/en" : ""}/library/${slug}`);
    assert.deepEqual(metadataForContent(article, repository).alternates?.languages, {
      "zh-CN": `https://paulzhang.org/library/${slug}`,
      "en-US": `https://paulzhang.org/en/library/${slug}`,
    });
  }
  assert.equal(libraryTopicLabel("zh-CN", "marriage"), "婚姻家庭");
  assert.equal(libraryTopicLabel("en-US", "marriage"), "Marriage & Family");
  assert.equal(contentTopicLabel("en-US", "marriage"), "Marriage");
});

test("combined collection finds each existing topic without admitting private or unrelated content", () => {
  const records = ["marriage", "family", "parenting", "work"].map((topic) => item({id: topic, canonicalId: topic, slug: topic, topics: [topic]}));
  records.push(item({id: "private-marriage", canonicalId: "private-marriage", slug: "private-marriage", topics: ["marriage"], visibility: "private"}));
  const repository = createContentRepository(records);
  assert.deepEqual(getLibraryCollectionItems(repository, "zh-CN", "marriage").map((entry) => entry.id), ["marriage", "family", "parenting"]);
  for (const topic of ["family", "parenting"]) assert.deepEqual(getActiveLibraryCollections([item({topics: [topic]})]), ["bible", "gospel", "theology", "formation", "marriage", "life-values", "work-money", "church"]);
  assert.deepEqual(getLibraryCollectionItems(repository, "zh-CN", "family").map((entry) => entry.id), ["family", "parenting"]);
});

test("plain Markdown preserves Chinese bytes and English prose outside documented KJV normalization", () => {
  assert.equal(hash(body("zh-CN")), provenance.sourceBodySha256["zh-CN"]);
  let english = body("en-US");
  assert.equal(hash(english), provenance.publishedBodySha256["en-US"]);
  assert.equal((english.match(/\(KJV\)/g) ?? []).length, 3);
  assert.doesNotMatch(english, /NIV|^import |^export |<\w+/m);
  for (const replacement of [...provenance.englishReplacements].reverse()) {
    assert.ok(english.includes(replacement.published));
    english = english.replace(replacement.published, replacement.source);
  }
  assert.equal(hash(english), provenance.sourceBodySha256["en-US"]);
});
