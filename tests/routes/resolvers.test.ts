import assert from "node:assert/strict";
import test from "node:test";
import { createContentRepository } from "../../src/lib/content/repository";
import { resolveGrowthStage, resolveLibrarySlug, resolveStorySlug } from "../../src/lib/routing/resolvers";
import { item } from "../content/fixtures";

const repository = createContentRepository([
  item({slug: "zh-article"}),
  item({id: "story", canonicalId: "story", slug: "zh-story", domain: "stories"}),
  item({id: "en", slug: "english-article", language: "en-US"}),
  item({id: "draft", canonicalId: "draft", slug: "draft", status: "draft"}),
]);

test("library and story routes resolve collections before public content", () => {
  assert.deepEqual(resolveLibrarySlug("bible", "zh-CN", repository), {kind: "collection", slug: "bible"});
  assert.equal(resolveLibrarySlug("zh-article", "zh-CN", repository).kind, "content");
  assert.equal(resolveStorySlug("zh-story", "zh-CN", repository).kind, "content");
});

test("locale, draft, and invalid routes return not-found", () => {
  assert.equal(resolveLibrarySlug("english-article", "zh-CN", repository).kind, "not-found");
  assert.equal(resolveLibrarySlug("draft", "zh-CN", repository).kind, "not-found");
  assert.equal(resolveStorySlug("unknown", "en-US", repository).kind, "not-found");
});

test("growth accepts only canonical V1 stages", () => {
  assert.deepEqual(resolveGrowthStage("multiply"), {kind: "collection", slug: "multiply"});
  assert.deepEqual(resolveGrowthStage("path"), {kind: "not-found"});
});
