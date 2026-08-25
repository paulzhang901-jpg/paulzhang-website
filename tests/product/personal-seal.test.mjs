import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");
const brandRoot = "public/brand/paul-zhang";

test("canonical A B C brand assets remain independent and available", () => {
  for (const file of ["paul-zhang-seal-A-primary.png", "paul-zhang-seal-B-website-mark.png", "paul-zhang-seal-C-favicon-micro-stamp.png"]) assert.equal(fs.existsSync(`${brandRoot}/${file}`), true, file);
});

test("B mark is used in the compact shared header", () => {
  const header = read("src/components/navigation/site-header.tsx");
  assert.match(header, /paul-zhang-seal-B-symbol\.png/);
  assert.match(header, /brandName/);
  assert.doesNotMatch(header, /paul-zhang-seal-A-primary/);
});

test("A seal supports the existing About section without changing Home structure", () => {
  const home = read("src/components/product/home-page.tsx");
  assert.match(home, /data-home-section="about"/);
  assert.match(home, /paul-zhang-seal-A-primary\.png/);
  const sections = [...home.matchAll(/data-home-section="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(sections, ["hero", "trust", "start", "entrances", "featured", "grow", "companionship", "about", "stay-connected"]);
  assert.match(home, /paul-hero-outdoor\.jpg/);
  assert.match(home, /paul-companionship-study\.jpg/);
});

test("C micro stamp provides App Router icons and review derivatives", () => {
  for (const file of ["src/app/icon.png", "src/app/apple-icon.png", `${brandRoot}/paul-zhang-seal-C-icon-16.png`, `${brandRoot}/paul-zhang-seal-C-icon-32.png`]) assert.equal(fs.existsSync(file), true, file);
});
