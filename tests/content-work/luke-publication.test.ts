import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import {discoverAndParseContentWorks} from "../../src/lib/content/works/discovery";
import {createContentWorkRepository} from "../../src/lib/content/works/repository";

const base = "public/ebooks";
const release = JSON.parse(fs.readFileSync(`${base}/luke-journey-release.json`, "utf8"));
const hash = (value: string | Buffer) => crypto.createHash("sha256").update(value).digest("hex");

test("Luke public work preserves all 80 approved study bodies and has no invented English edition", () => {
  const {works, units} = discoverAndParseContentWorks();
  const repo = createContentWorkRepository(works, units);
  const work = repo.getPublicWorkBySlug("luke-journey", "zh-CN");
  assert.ok(work);
  assert.equal(work.work.workType, "bible_study_book");
  assert.equal(repo.getPublicWorkBySlug("luke-journey", "en-US"), null);
  const studies = repo.getOrderedUnits(work.work.canonicalId, "zh-CN").filter(unit => /^unit-\d{2}$/.test(unit.slug));
  assert.equal(studies.length, 80);
  const master = fs.readFileSync(`${base}/luke-journey.md`, "utf8");
  const parts = master.split(/^<a id="([^"]+)"><\/a>\n\n/m);
  const sections: Record<string, string> = {};
  for (let i=1; i<parts.length; i+=2) sections[parts[i]] = parts[i+1].trim()+"\n";
  for (const [sid, expected] of Object.entries(release.sections) as [string, {slug:string; master_body_sha256:string; web_body_sha256:string}][]) {
    assert.equal(hash(sections[sid]), expected.master_body_sha256);
    const converted = sections[sid].replace(/\]\(#([a-z0-9]+)\)/g, (_, id: string) => `](/stories/luke-journey/${release.sections[id].slug})`);
    const unit = units.find(unit => unit.canonicalId===`luke-${sid}`);
    assert.ok(unit);
    assert.equal(unit.body.trim(), converted.trim());
    assert.equal(hash(converted), expected.web_body_sha256);
  }
  for (let n=1; n<=80; n++) assert.equal(studies[n-1].slug, `unit-${String(n).padStart(2,"0")}`);
});

test("Luke downloads retain the author-approved binary hashes and every internal contents link resolves", () => {
  for (const [file, expected] of Object.entries(release.files) as [string, {sha256:string;bytes:number}][]) {
    const bytes=fs.readFileSync(path.join(base,file));
    assert.equal(hash(bytes),expected.sha256);
    assert.equal(bytes.length,expected.bytes);
  }
  const paths=new Set(Object.values(release.sections).map((entry) => `/stories/luke-journey/${(entry as {slug:string}).slug}`));
  for (const file of fs.readdirSync("content/works/luke-journey/zh-CN")) {
    const body=matter(fs.readFileSync(`content/works/luke-journey/zh-CN/${file}`,"utf8")).content;
    for (const match of body.matchAll(/\]\((\/stories\/luke-journey\/[^)]+)\)/g)) assert.ok(paths.has(match[1]),match[1]);
  }
});
