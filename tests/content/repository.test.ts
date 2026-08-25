import assert from "node:assert/strict";
import test from "node:test";
import { createContentRepository } from "../../src/lib/content/repository";
import { createSearchDocument } from "../../src/lib/content/search-document";
import { getActiveLibraryCollections, getLibraryCollectionItems, getLibraryItems } from "../../src/lib/content/library";
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

test("Truth Library discovery consumes public repository content and canonical topics", () => {
  const bible = item({id: "bible", canonicalId: "bible", slug: "bible", topics: ["bible"]});
  const formation = item({id: "formation", canonicalId: "formation", slug: "formation", topics: ["spiritual-formation"]});
  const story = item({id: "story", canonicalId: "story", slug: "story", domain: "stories", topics: ["bible"]});
  const privateItem = item({id: "private-library", canonicalId: "private-library", slug: "private-library", visibility: "private", topics: ["bible"]});
  const repository = createContentRepository([bible, formation, story, privateItem]);
  assert.deepEqual(getLibraryItems(repository, "zh-CN").map((entry) => entry.id), [bible.id, formation.id]);
  assert.deepEqual(getLibraryCollectionItems(repository, "zh-CN", "bible").map((entry) => entry.id), [bible.id]);
  assert.deepEqual(getLibraryCollectionItems(repository, "zh-CN", "formation").map((entry) => entry.id), [formation.id]);
  assert.deepEqual(getActiveLibraryCollections([bible, formation]), ["bible", "formation"]);
});
