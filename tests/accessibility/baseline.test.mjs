import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("shared locale shell preserves semantic landmarks and keyboard skip navigation", () => {
  const shell = read("src/components/layout/locale-root-layout.tsx");
  assert.match(shell, /<html lang=\{locale\}>/);
  assert.match(shell, /className="skip-link" href="#main-content"/);
  assert.match(shell, /<main id="main-content" tabIndex=\{-1\}/);
  assert.match(read("src/components/navigation/site-header.tsx"), /<header/);
  assert.match(read("src/components/layout/site-footer.tsx"), /<footer/);
});

test("navigation landmarks have accessible names and use native keyboard controls", () => {
  const header = read("src/components/navigation/site-header.tsx");
  assert.match(header, /<nav aria-label=/);
  assert.match(header, /<details/);
  assert.match(header, /<summary/);
  assert.match(read("src/components/navigation/breadcrumbs.tsx"), /aria-current="page"/);
  assert.match(read("src/components/layout/site-footer.tsx"), /<nav aria-label=/);
});

test("shared page shells provide one page-level heading contract", () => {
  assert.match(read("src/components/layout/foundation-page.tsx"), /SectionHeading/);
  assert.match(read("src/components/layout/section.tsx"), /<h1/);
  assert.match(read("src/components/content/content-page.tsx"), /<h1/);
});

test("focus, skip-link, and reduced-motion safeguards are present", () => {
  const css = read("src/styles/globals.css");
  assert.match(css, /:focus-visible/);
  assert.match(css, /\.skip-link:focus/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("Next.js accessibility lint baseline remains enabled for image alt readiness", () => {
  const eslint = read("eslint.config.mjs");
  assert.match(eslint, /eslint-config-next\/core-web-vitals/);
});
