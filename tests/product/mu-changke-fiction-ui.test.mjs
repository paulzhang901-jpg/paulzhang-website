import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

test("fiction landing uses the approved derived data pipeline and renders discovery", () => {
  const landing = read("src/components/fiction/fiction-landing-page.tsx");
  const discovery = read("src/components/fiction/fiction-discovery.tsx");
  assert.match(landing, /getFictionCardRecords/);
  assert.match(landing, /牧长客 · 小说世界/);
  assert.match(discovery, /type="search"/);
  assert.match(discovery, /aria-live="polite"/);
});

test("fiction detail omits absent sections and renders CTA without an external link", () => {
  const detail = read("src/components/fiction/fiction-work-page.tsx");
  assert.match(detail, /if \(!text\) return null/);
  assert.match(detail, /work\.officialReadingCTA/);
  assert.doesNotMatch(detail, /href=\{work\.officialReadingCTA/);
  assert.match(detail, /CreativeWork/);
});

test("runtime repository consumes only adapter-derived application data", () => {
  const repository = read("src/lib/fiction/repository.ts");
  assert.match(repository, /canonical-registry\/registry\.json/);
  assert.doesNotMatch(repository, /canonical\.yaml|works\.yaml|publication-rights\.yaml|manuscript|contract/i);
});
