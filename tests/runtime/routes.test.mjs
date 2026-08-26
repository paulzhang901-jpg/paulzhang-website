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

test("all approved public routes resolve in zh-CN and under the /en projection", async () => {
  const {localizedPath, resolveEnglishSegments, routes} = await import("../../src/lib/i18n/routing.ts");
  for (const route of routes) {
    assert.equal(localizedPath(route.id, "zh-CN"), route.path, `${route.id} zh-CN`);
    const english = route.path === "/" ? "/en" : `/en${route.path}`;
    assert.equal(localizedPath(route.id, "en-US"), english, `${route.id} en-US`);
    const segments = route.path === "/" ? undefined : route.path.slice(1).split("/");
    assert.equal(resolveEnglishSegments(segments), route.id, `${route.id} resolver`);
  }
});

test("deferred application routes are absent", () => {
  for (const route of ["journey", "account", "admin", "auth", "ask"]) {
    assert.equal(fs.existsSync(path.join(root, "src/app", route)), false, `deferred route introduced: /${route}`);
  }
});

test("content work landing and nested unit route templates exist for both locales", () => {
  for (const page of [
    "src/app/(zh)/stories/[slug]/page.tsx",
    "src/app/(zh)/stories/[slug]/[unitSlug]/page.tsx",
    "src/app/(en)/en/stories/[slug]/page.tsx",
    "src/app/(en)/en/stories/[slug]/[unitSlug]/page.tsx",
  ]) assert.ok(fs.existsSync(path.join(root, page)), `missing ${page}`);
});
