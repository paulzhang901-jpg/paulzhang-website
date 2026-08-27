import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { filterFictionWorks, getSharedFictionThemes } from "../../src/lib/fiction/search";
import { fictionLandingMetadata, fictionWorkMetadata } from "../../src/lib/fiction/metadata";
import { fictionPath, getFictionCardRecords, getFictionCoverPath, getFictionWork, getFictionWorks } from "../../src/lib/fiction/repository";

const root = process.cwd();
const canonicalRoot = path.join(root, "config/fiction/intake/mu-changke-fiction-canonical-package-v1-final");
const derivation = JSON.parse(fs.readFileSync(path.join(root, "config/fiction/intake/DERIVATION-MANIFEST.json"), "utf8"));
const sha256 = (file: string) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

test("public fiction repository exposes exactly twelve LOCKED canonical works", () => {
  const works = getFictionWorks();
  assert.equal(works.length, 12);
  assert.equal(new Set(works.map((work) => work.canonicalTitle)).size, 12);
  assert.equal(new Set(works.map((work) => work.slug)).size, 12);
  assert.ok(works.every((work) => work.editorialStatus === "LOCKED"));
  assert.equal(getFictionWork("not-a-work"), null);
  assert.equal(works.some((work) => ["为什么偏偏是我", "每个人都来安慰他"].includes(work.canonicalTitle)), false);
});

test("all twelve approved public cover copies preserve canonical bytes", () => {
  for (const work of getFictionWorks()) {
    const publicPath = path.join(root, "public", getFictionCoverPath(work));
    const filename = path.basename(publicPath);
    const sourcePath = path.join(canonicalRoot, "covers/assets", filename);
    assert.ok(fs.existsSync(publicPath), `missing ${publicPath}`);
    assert.equal(sha256(publicPath), sha256(sourcePath), `${work.slug} cover bytes changed`);
  }
});

test("火没有降下来 remains v3 only in the verified derivation mapping", () => {
  const fire = derivation.sourceMappings.find((entry: {slug: string}) => entry.slug === "fire-did-not-fall");
  assert.equal(fire.canonicalVersion, "v3");
  assert.doesNotMatch(JSON.stringify(fire), /"v[12]"/);
});

test("fiction routes and title-theme search are deterministic", () => {
  assert.equal(fictionPath(), "/fiction");
  assert.equal(fictionPath("enoch-longevity-era"), "/fiction/enoch-longevity-era");
  assert.equal(fictionPath(undefined, "en-US"), "/en/fiction");
  const cards = getFictionCardRecords();
  assert.deepEqual(filterFictionWorks(cards, "超级算法").map((work) => work.slug), ["super-algorithm"]);
  assert.ok(filterFictionWorks(cards, "生命").some((work) => work.slug === "enoch-longevity-era"));
  assert.equal(filterFictionWorks(cards, "not-present").length, 0);
  assert.deepEqual(getSharedFictionThemes(cards), ["尊严", "匮乏", "孤独", "希望", "恐惧", "等待", "忠诚"]);
});

test("fiction SEO preserves distinct canonical and locale alternate URLs", () => {
  const landing = fictionLandingMetadata("en-US");
  assert.equal(landing.alternates?.canonical, "https://paulzhang.org/en/fiction");
  assert.deepEqual(landing.alternates?.languages, {
    "zh-CN": "https://paulzhang.org/fiction",
    "en-US": "https://paulzhang.org/en/fiction",
  });

  const work = getFictionWorks()[0];
  const detail = fictionWorkMetadata(work, "en-US");
  assert.equal(detail.alternates?.canonical, `https://paulzhang.org/en/fiction/${work.slug}`);
  assert.equal(detail.alternates?.languages?.["zh-CN"], `https://paulzhang.org/fiction/${work.slug}`);
});

test("rights boundary exposes no direct URL or prohibited public field", () => {
  const serialized = JSON.stringify(getFictionWorks());
  assert.doesNotMatch(serialized, /https?:\/\//i);
  for (const field of ["manuscript", "chapters", "contractPath", "internalRightsAnalysis", "verifiedUrl"]) assert.doesNotMatch(serialized, new RegExp(`"${field}"`, "i"));
  for (const forbidden of [
    "src/app/(zh)/fiction/[slug]/chapter",
    "src/app/(zh)/fiction/[slug]/read",
    "src/app/(en)/en/fiction/[slug]/chapter",
    "src/app/(en)/en/fiction/[slug]/read",
  ]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, `forbidden route ${forbidden}`);
});
