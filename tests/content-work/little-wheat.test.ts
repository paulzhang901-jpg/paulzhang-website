import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import matter from "gray-matter";
import sitemap from "../../src/app/sitemap";
import {getContentRepository} from "../../src/lib/content/repository";
import {discoverAndParseContentWorks} from "../../src/lib/content/works/discovery";
import {createContentWorkRepository} from "../../src/lib/content/works/repository";
import {getUnitStaticParams, getWorkStaticParams, resolveUnitRoute, resolveWorkRoute, unitPath, workPath} from "../../src/lib/content/works/routing";
import {validateContentWorks} from "../../src/lib/content/works/validation";

const root = path.join(process.cwd(), "content", "works", "little-wheat");
const lockPath = path.join(root, "governance", "LOCK.yaml");
const registries = path.join(root, "governance", "registries");
const lockSha256 = "1b63b32cf1eb64b9cbd8daea733084d15fb5dfc8352849c74f4e44c2ed8d7a99";
const registryNames = ["canonical", "facts", "structure", "claims", "scripture", "quotations", "provenance", "translations", "media-ledger", "publication"];

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function parseYaml<T>(file: string): T {
  return matter(`---\n${fs.readFileSync(file, "utf8")}\n---`).data as T;
}

function canonicalBody(file: string) {
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.subarray(0, 4).toString(), "---\n");
  const end = bytes.indexOf(Buffer.from("---\n"), 4);
  assert.notEqual(end, -1);
  return bytes.subarray(end + 4);
}

const discovered = discoverAndParseContentWorks(path.join(process.cwd(), "content", "works"));
const littleWheat = discovered.works.find((work) => work.canonicalId === "work-little-wheat-v1");
assert.ok(littleWheat);
const units = discovered.units.filter((unit) => unit.workCanonicalId === littleWheat.canonicalId);
const repository = createContentWorkRepository([littleWheat], units);

test("Little Wheat Work and Unit schemas preserve one bilingual work and 15 canonical identities", () => {
  const report = validateContentWorks([littleWheat], units);
  assert.deepEqual(report, {errors: [], warnings: []});
  assert.equal(littleWheat.id, "work-little-wheat-v1");
  assert.equal(littleWheat.workType, "story_book");
  assert.deepEqual(littleWheat.representations.map(({language}) => language).sort(), ["en-US", "zh-CN"]);
  assert.equal(littleWheat.units.length, 15);
  assert.equal(new Set(littleWheat.units.map(({canonicalId}) => canonicalId)).size, 15);
  assert.equal(units.length, 30);
  assert.equal(units.filter(({language}) => language === "zh-CN").length, 15);
  assert.equal(units.filter(({language}) => language === "en-US").length, 15);
  assert.equal(new Set(units.map(({canonicalId}) => canonicalId)).size, 15);
  assert.equal(new Set(units.map(({canonicalId, language}) => `${canonicalId}:${language}`)).size, 30);
});

test("runtime IDs, parents, order, types, slugs, and routes follow the approved mapping", () => {
  const structure = parseYaml<{units: Array<{unit_id: string; order: number; type: string; chapter?: number; zh_path: string; en_path: string}>}>(path.join(registries, "structure.yaml"));
  const typeMap: Record<string, string> = {dedication: "front_matter", prologue: "front_matter", chapter: "chapter", guest_testimony: "chapter", father_letter: "chapter", digital_memory_album: "chapter", theological_reflection: "chapter", eschatological_reflection: "chapter", family_statement_of_faith: "supplement"};
  for (const source of structure.units) {
    const localized = units.filter(({canonicalId}) => canonicalId === source.unit_id);
    assert.equal(localized.length, 2);
    assert.ok(localized.every(({id, canonicalId, workCanonicalId, order, unitType}) => id === source.unit_id && canonicalId === source.unit_id && workCanonicalId === littleWheat.canonicalId && order === source.order + 1 && unitType === typeMap[source.type]));
    for (const unit of localized as typeof units) {
      const sourcePath: string = unit.language === "zh-CN" ? source.zh_path : source.en_path;
      assert.equal(unit.slug, path.basename(sourcePath));
      assert.equal(unit.chapterNumber, source.chapter);
      assert.equal(unitPath("little-wheat", unit.slug, unit.language), `${unit.language === "en-US" ? "/en" : ""}/stories/little-wheat/${unit.slug}`);
    }
  }
  assert.deepEqual(littleWheat.units.map(({order}) => order), Array.from({length: 15}, (_, index) => index + 1));
  for (const locale of ["zh-CN", "en-US"] as const) assert.equal(workPath("little-wheat", locale), `${locale === "en-US" ? "/en" : ""}/stories/little-wheat`);
  assert.equal(new Set(units.map(({workCanonicalId, language, slug}) => `${workCanonicalId}:${language}:${slug}`)).size, 30);
});

test("LOCK, all registries, and all canonical manuscript bodies retain their governed hashes", () => {
  assert.equal(sha256(fs.readFileSync(lockPath)), lockSha256);
  const lock = parseYaml<{package: {status: string}; counts: Record<string, number>; files: Array<{path: string; sha256: string; bytes: number}>}>(lockPath);
  assert.equal(lock.package.status, "MATERIALIZED_LOCKED_CODEX_READY");
  assert.equal(lock.files.length, 40);
  assert.equal(lock.counts.controlled_files_total, 41);
  assert.equal(lock.counts.registries, 10);
  assert.equal(lock.counts.media_assets, 0);
  assert.deepEqual(fs.readdirSync(registries).filter((name) => name.endsWith(".yaml")).sort(), registryNames.map((name) => `${name}.yaml`).sort());
  for (const entry of lock.files) {
    const isRegistry = entry.path.startsWith("registries/");
    const runtimePath = isRegistry ? path.join(root, "governance", entry.path) : path.join(root, entry.path);
    const governedBytes = isRegistry ? fs.readFileSync(runtimePath) : canonicalBody(runtimePath);
    assert.equal(governedBytes.byteLength, entry.bytes, entry.path);
    assert.equal(sha256(governedBytes), entry.sha256, entry.path);
  }
});

test("Chapter 8 preserves the missing-original provenance boundary without reconstruction", () => {
  const provenance = parseYaml<{sources: Array<{source_id: string; status?: string}>}>(path.join(registries, "provenance.yaml"));
  const translations = parseYaml<{alignment: Array<{zh: string; en: string; status: string}>; chapter_08_special_rule: {Pastor_John_original_english: {status: string}; reverse_translation: {allowed: boolean}; synthetic_original: {allowed: boolean}}}>(path.join(registries, "translations.yaml"));
  assert.equal(provenance.sources.find(({source_id}) => source_id === "lw-src-pastor-john-en-original")?.status, "MISSING");
  assert.equal(translations.alignment.find(({zh}) => zh === "lw-09-ch08")?.status, "ALIGNED_WITH_PROVENANCE_RESTRICTION");
  assert.equal(translations.chapter_08_special_rule.Pastor_John_original_english.status, "MISSING");
  assert.equal(translations.chapter_08_special_rule.reverse_translation.allowed, false);
  assert.equal(translations.chapter_08_special_rule.synthetic_original.allowed, false);
  const chapter = units.find(({canonicalId, language}) => canonicalId === "lw-09-ch08" && language === "en-US");
  assert.ok(chapter);
  assert.match(chapter.body, /independent original English manuscript[\s\S]*has not yet been recovered or verified/);
});

test("review/private lifecycle blocks Work, Unit, sitemap, search, and related-content exposure", async () => {
  const publication = parseYaml<{runtime_initial_state: {status: string; published_at: null; visibility: string; access_level: string; public_discovery: boolean; search_indexing: boolean; sitemap_inclusion: boolean}; media: {include_assets: boolean}}>(path.join(registries, "publication.yaml"));
  assert.deepEqual(publication.runtime_initial_state, {status: "review", published_at: null, visibility: "private", access_level: "public", public_discovery: false, search_indexing: false, sitemap_inclusion: false});
  assert.equal(publication.media.include_assets, false);
  assert.ok(littleWheat.representations.every(({status, publishedAt, visibility, accessLevel}) => status === "review" && publishedAt === undefined && visibility === "private" && accessLevel === "public"));
  assert.ok(units.every(({status, publishedAt, visibility, accessLevel}) => status === "review" && publishedAt === undefined && visibility === "private" && accessLevel === "public"));
  for (const locale of ["zh-CN", "en-US"] as const) {
    assert.equal(repository.getPublishedWorks(locale).length, 0);
    assert.equal(repository.getPublicWorkBySlug("little-wheat", locale), null);
    assert.equal(repository.getPublicUnitBySlug("little-wheat", "00-dedication", locale), null);
    assert.equal(resolveWorkRoute("little-wheat", locale, repository).kind, "not-found");
    assert.equal(resolveUnitRoute("little-wheat", "00-dedication", locale, repository).kind, "not-found");
    assert.deepEqual(getWorkStaticParams(locale, repository), []);
    assert.deepEqual(getUnitStaticParams(locale, repository), []);
  }
  const publicContent = await getContentRepository();
  assert.equal(publicContent.getSearchDocuments().some(({canonical_id}) => canonical_id === littleWheat.canonicalId), false);
  assert.equal(publicContent.getPublishedContent().some(({canonicalId}) => canonicalId === littleWheat.canonicalId), false);
  assert.equal(publicContent.all().some(({canonicalId}) => canonicalId === littleWheat.canonicalId), false);
  assert.equal((await sitemap()).some(({url}) => /\/stories\/little-wheat(?:\/|$)/.test(url)), false);
});

test("canonical identity metadata is exact and no physical media or canonical duplicates were introduced", () => {
  const canonical = parseYaml<{identity: {child: {canonical_name_en: string}}}>(path.join(registries, "canonical.yaml"));
  assert.equal(canonical.identity.child.canonical_name_en, "John Earnest Zhang");
  const files: string[] = [];
  const visit = (directory: string) => fs.readdirSync(directory, {withFileTypes: true}).forEach((entry) => entry.isDirectory() ? visit(path.join(directory, entry.name)) : files.push(path.join(directory, entry.name)));
  visit(root);
  assert.equal(files.filter((file) => /\.(?:avif|gif|jpe?g|mp3|mp4|ogg|png|svg|webm|webp|wav)$/i.test(file)).length, 0);
  assert.equal(files.filter((file) => file.endsWith("work.json")).length, 1);
  assert.equal(files.filter((file) => /\/(?:zh-CN|en-US)\/.*\.md$/.test(file)).length, 30);
});
