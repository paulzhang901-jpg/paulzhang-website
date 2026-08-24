import assert from "node:assert/strict";
import test from "node:test";
import { createContentRepository } from "../../src/lib/content/repository";
import { createSearchDocument } from "../../src/lib/content/search-document";
import { item } from "./fixtures";

test("private, draft, and member content never enter public queries or search documents", () => {
  const published = item();
  const draft = item({id: "draft", canonicalId: "draft", slug: "draft", status: "draft"});
  const privateItem = item({id: "private", canonicalId: "private", slug: "private", visibility: "private"});
  const member = item({id: "member", canonicalId: "member", slug: "member", accessLevel: "member"});
  const repository = createContentRepository([published, draft, privateItem, member]);
  assert.deepEqual(repository.getPublishedContent().map((entry) => entry.id), [published.id]);
  assert.equal(repository.getSearchDocuments().length, 1);
  assert.equal(createSearchDocument(privateItem), null);
});

test("related content is deterministic, same-locale, and public-only", () => {
  const source = item({relatedContent: ["explicit"]});
  const explicit = item({id: "explicit", canonicalId: "explicit", slug: "explicit"});
  const inferred = item({id: "inferred", canonicalId: "inferred", slug: "inferred", publishedAt: new Date("2026-08-23T00:00:00Z")});
  const english = item({id: "english", canonicalId: "english", slug: "english", language: "en-US"});
  const privateItem = item({id: "private", canonicalId: "private", slug: "private", visibility: "private"});
  assert.deepEqual(createContentRepository([source, inferred, english, privateItem, explicit]).getRelatedContent(source).map((entry) => entry.id), ["explicit", "inferred"]);
});
