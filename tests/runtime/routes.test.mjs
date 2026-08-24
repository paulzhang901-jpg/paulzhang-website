import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const zhRoot = path.join(root, "src/app/(zh)");

test("approved Chinese V1 route pages exist", () => {
  const pages = [
    "page.tsx", "start/page.tsx", "library/page.tsx", "stories/page.tsx",
    "together/page.tsx", "grow/page.tsx", "community/page.tsx", "about/page.tsx",
    "gccm/page.tsx", "search/page.tsx", "legal/privacy/page.tsx", "legal/terms/page.tsx",
  ];
  for (const page of pages) assert.ok(fs.existsSync(path.join(zhRoot, page)), `missing ${page}`);
});

test("English locale uses a shared approved-route resolver", () => {
  assert.ok(fs.existsSync(path.join(root, "src/app/(en)/en/[[...segments]]/page.tsx")));
  const source = fs.readFileSync(path.join(root, "src/lib/i18n/routing.ts"), "utf8");
  assert.match(source, /resolveEnglishSegments/);
  assert.match(source, /\/en/);
});

test("deferred application routes are absent", () => {
  for (const route of ["journey", "account", "admin", "auth", "ask"]) {
    assert.equal(fs.existsSync(path.join(root, "src/app", route)), false, `deferred route introduced: /${route}`);
  }
});
