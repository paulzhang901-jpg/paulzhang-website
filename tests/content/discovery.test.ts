import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {discoverAndParseContent, discoverContentFiles, parseContentFile} from "../../src/lib/content/discovery";
import {discoverAndParseContentWorks, discoverContentWorkFiles} from "../../src/lib/content/works/discovery";

function fixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "content-discovery-"));
  const validSource = discoverContentFiles().find((file) => file.includes(`${path.sep}zh-CN${path.sep}`));
  assert.ok(validSource);
  fs.mkdirSync(path.join(root, "zh-CN", "library"), {recursive: true});
  fs.copyFileSync(validSource, path.join(root, "zh-CN", "library", "valid.md"));
  fs.mkdirSync(path.join(root, "works", "generic-work", "en-US"), {recursive: true});
  fs.writeFileSync(path.join(root, "works", "generic-work", "work.json"), "{}\n");
  fs.writeFileSync(path.join(root, "works", "generic-work", "en-US", "unit.md"), "generic work unit\n");
  return root;
}

test("ContentItem discovery prunes the generic content/works namespace while ContentWork discovery owns it", (context) => {
  const root = fixtureRoot();
  context.after(() => fs.rmSync(root, {recursive: true, force: true}));

  const contentFiles = discoverContentFiles(root);
  assert.equal(contentFiles.length, 1);
  assert.equal(path.relative(root, contentFiles[0]), path.join("zh-CN", "library", "valid.md"));
  assert.equal(discoverAndParseContent(root).length, 1);

  const workFiles = discoverContentWorkFiles(path.join(root, "works"));
  assert.deepEqual(workFiles.manifests.map((file) => path.basename(file)), ["work.json"]);
  assert.deepEqual(workFiles.units.map((file) => path.basename(file)), ["unit.md"]);
});

test("existing locale parsing remains strict outside the reserved namespace", (context) => {
  const root = fixtureRoot();
  context.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const valid = discoverContentFiles(root)[0];
  assert.equal(parseContentFile(valid, root).frontmatter.language, "zh-CN");

  const invalid = path.join(root, "invalid-locale", "library", "invalid.md");
  fs.mkdirSync(path.dirname(invalid), {recursive: true});
  fs.copyFileSync(valid, invalid);
  assert.throws(() => parseContentFile(invalid, root), /invalid locale folder/);
});

test("the authoritative ContentWork discovery still materializes Little Wheat exactly once", () => {
  const root = path.join(process.cwd(), "content", "works");
  const files = discoverContentWorkFiles(root);
  const discovered = discoverAndParseContentWorks(root);
  const work = discovered.works.filter(({canonicalId}) => canonicalId === "work-little-wheat-v1");
  const units = discovered.units.filter(({workCanonicalId}) => workCanonicalId === "work-little-wheat-v1");

  assert.equal(files.manifests.filter((file) => file.endsWith(path.join("little-wheat", "work.json"))).length, 1);
  assert.equal(work.length, 1);
  assert.equal(new Set(units.map(({canonicalId}) => canonicalId)).size, 15);
  assert.equal(units.length, 30);
  assert.equal(units.filter(({language}) => language === "zh-CN").length, 15);
  assert.equal(units.filter(({language}) => language === "en-US").length, 15);
});
