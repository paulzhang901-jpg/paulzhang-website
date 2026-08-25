import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("Truth Library index and collections use the canonical repository", () => {
  const library = read("src/components/content/library-page.tsx");
  const zhRoute = read("src/app/(zh)/library/page.tsx");
  const enRoute = read("src/app/(en)/en/[[...segments]]/page.tsx");
  const dynamicRoute = read("src/components/content/dynamic-content-route.tsx");
  assert.match(zhRoute, /getContentRepository/);
  assert.match(enRoute, /routeId === "library"/);
  assert.match(library, /getLibraryItems/);
  assert.match(library, /items\.length/);
  assert.match(library, /earlyTitle/);
  assert.match(dynamicRoute, /LibraryCollectionPage/);
  assert.doesNotMatch(library, /zhenli-yuedu-shili|truth-reading-sample/);
});

test("technical Truth fixtures remain review-only and absent from public discovery", () => {
  for (const file of ["content/zh-CN/library/zhenli-yuedu-shili.mdx", "content/en-US/library/truth-reading-sample.mdx"]) {
    assert.match(read(file), /status: review/);
  }
});

test("Truth detail preserves reading, translation, related-content, and next-step contracts", () => {
  const detail = read("src/components/content/content-page.tsx");
  assert.match(detail, /ReadingContainer/);
  assert.match(detail, /resolvePublicTranslation/);
  assert.match(detail, /getRelatedContent/);
  assert.match(detail, /data-translation-unavailable/);
  assert.match(detail, /contentPath\(entry\)/);
  assert.match(detail, /companionshipPath/);
  assert.match(detail, /item\.domain === "stories"/);
  assert.match(detail, /contentIndexPath/);
});

test("Truth Library adds no client runtime or competing registries", () => {
  const library = read("src/components/content/library-page.tsx");
  assert.doesNotMatch(library, /"use client"/);
  assert.equal(fs.existsSync("config/architecture/library-taxonomy.yaml"), false);
  assert.equal(fs.existsSync("src/lib/content/library-repository.ts"), false);
});
