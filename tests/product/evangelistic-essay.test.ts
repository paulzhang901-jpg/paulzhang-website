import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import crypto from "node:crypto";
import {getContentRepository} from "../../src/lib/content/repository";
import {contentPath} from "../../src/lib/content/paths";
import {metadataForContent} from "../../src/lib/content/metadata";
import {getLibraryCollectionItems} from "../../src/lib/content/library";
import {contentTypeLabel} from "../../src/config/library";

const provenance = JSON.parse(fs.readFileSync("artifacts/content/vastness-and-eternity/provenance.json", "utf8"));
const hash = (body: string) => crypto.createHash("sha256").update(body).digest("hex");
const body = (locale: string) => fs.readFileSync(`content/${locale}/library/vastness-and-eternity.mdx`, "utf8").split("---\n").slice(2).join("---\n");

test("paired evangelistic editions are public articles in the existing Gospel collection with reciprocal SEO", async () => {
  const repository = await getContentRepository();
  const editions = repository.getContentByCanonicalId("vastness-and-eternity");
  assert.equal(editions.length, 2);
  for (const item of editions) {
    assert.equal(item.contentType, "article");
    assert.ok(getLibraryCollectionItems(repository, item.language, "gospel").some((entry) => entry.id === item.id));
    const otherLocale = item.language === "zh-CN" ? "en-US" : "zh-CN";
    const other = repository.resolvePublicTranslation(item.canonicalId, otherLocale, item);
    assert.equal(other.available, true);
    assert.equal(other.status, "published");
    const route = `${item.language === "en-US" ? "/en" : ""}/library/vastness-and-eternity`;
    assert.equal(contentPath(item), route);
    const meta = metadataForContent(item, repository);
    assert.equal(String(meta.alternates?.canonical), `https://paulzhang.org${route}`);
    assert.deepEqual(meta.alternates?.languages, {"zh-CN": "https://paulzhang.org/library/vastness-and-eternity", "en-US": "https://paulzhang.org/en/library/vastness-and-eternity"});
    assert.equal(contentTypeLabel(item.language, item.contentType, item.topics), item.language === "zh-CN" ? "传福音文集" : "Evangelistic Essays");
  }
  assert.equal(contentTypeLabel("en-US", "sermon", ["gospel"]), "Sermon");
  assert.equal(contentTypeLabel("en-US", "article", ["bible"]), "Article");
});

test("Chinese source is intact and English changes are confined to verified KJV substitutions", () => {
  assert.equal(hash(body("zh-CN")), provenance.sourceBodySha256["zh-CN"]);
  const english = body("en-US");
  assert.equal(hash(english), provenance.publishedBodySha256["en-US"]);
  assert.equal((english.match(/\(KJV\)/g) ?? []).length, 9);
  let restored = english.replace("on this subject: “", "on this subject : “");
  for (const replacement of [...provenance.kjvReplacements].reverse()) {
    assert.ok(restored.includes(replacement.published));
    restored = restored.replace(replacement.published, replacement.source);
  }
  assert.equal(hash(restored), provenance.sourceBodySha256["en-US"]);
});
