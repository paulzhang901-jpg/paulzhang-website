import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const canonicalRoot = path.join(root, "config/fiction/intake/mu-changke-fiction-canonical-package-v1-final");
const derivedRegistryPath = path.join(root, "config/fiction/intake/canonical-registry/registry.json");
const derivedEditorialRoot = path.join(root, "config/fiction/intake/editorial-packages");
const derivedCoversPath = path.join(root, "config/fiction/intake/covers/manifest.json");
const derivationPath = path.join(root, "config/fiction/intake/DERIVATION-MANIFEST.json");
const marker = "DERIVED_FROM_LOCKED_CANONICAL_PACKAGE";

const fail = (message) => { throw new Error(message); };
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const scalar = (raw) => {
  const value = raw.trim();
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) return value.slice(1, -1);
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
};
const yamlValue = (text, key) => {
  const match = text.match(new RegExp(`^\\s*${key}:\\s*(.+?)\\s*$`, "m"));
  if (!match) fail(`missing YAML key ${key}`);
  return scalar(match[1]);
};
const parseWorks = (text) => {
  const works = [];
  let current;
  for (const line of text.split(/\r?\n/)) {
    const item = line.match(/^- ([a-z_]+):\s*(.*)$/);
    if (item) { current = {[item[1]]: scalar(item[2])}; works.push(current); continue; }
    const field = line.match(/^  ([a-z_]+):\s*(.*)$/);
    if (field && current) current[field[1]] = scalar(field[2]);
  }
  return works;
};

const lock = readJson(path.join(canonicalRoot, "PACKAGE-LOCK-MANIFEST.json"));
const hashResults = Object.entries(lock.files).map(([relative, expected]) => {
  const target = path.join(canonicalRoot, relative);
  if (!fs.existsSync(target)) return {path: relative, status: "MISSING"};
  const bytes = fs.readFileSync(target);
  return {path: relative, status: bytes.length === expected.bytes && hash(bytes) === expected.sha256 ? "PASS" : "MISMATCH"};
});
if (hashResults.some((entry) => entry.status !== "PASS") || hashResults.length !== 34) fail("canonical hash verification failed");

const works = parseWorks(fs.readFileSync(path.join(canonicalRoot, "works.yaml"), "utf8"));
const approval = fs.readFileSync(path.join(canonicalRoot, "editorial-approval-record.yaml"), "utf8");
const rights = fs.readFileSync(path.join(canonicalRoot, "publication-rights.yaml"), "utf8");
const provenance = fs.readFileSync(path.join(canonicalRoot, "provenance.yaml"), "utf8");
const sourceCovers = readJson(path.join(canonicalRoot, "covers/manifest.json"));
const registry = readJson(derivedRegistryPath);
const covers = readJson(derivedCoversPath);
const derivation = readJson(derivationPath);

if (derivation.status !== marker) fail("derived outputs are not marked");
if (registry.registryName !== "Mu Changke Fiction Editorial Registry" || registry.registryVersion !== "1.0" || registry.author !== "牧长客") fail("derived registry identity mismatch");
if (works.length !== 12 || registry.works.length !== 12 || covers.entries.length !== 12) fail("12-work count mismatch");
if (yamlValue(approval, "author_approval") !== "APPROVED" || yamlValue(approval, "all_public_packages") !== "LOCKED") fail("approval/lock mismatch");
if (yamlValue(provenance, "false_historical_claims") !== "0") fail("false historical claim count non-zero");
for (const key of ["manuscripts", "chapters", "contracts", "internal_rights_analysis", "unverified_official_urls"]) if (yamlValue(rights, key) !== false) fail(`rights boundary failed for ${key}`);

const allowedKeys = ["canonicalTitle", "slug", "workType", "collection", "cover", "editorialHook", "rightsSafeIntroduction", "themes", "whyRead", "readingExperience", "biblicalCulturalNote", "authorCreativeNote", "publicationNote", "officialReadingCTA", "rightsStatus", "editorialVersion", "editorialStatus"];
const sourceCoverByKey = new Map(sourceCovers.mappings.map((entry) => [entry.key, entry]));
const derivedCoverByTitle = new Map(covers.entries.map((entry) => [entry.canonicalTitle, entry]));
const titles = new Set();
const slugs = new Set();
const crossReferences = [];

for (let index = 0; index < works.length; index += 1) {
  const work = works[index];
  const record = registry.works[index];
  const editorialPath = path.join(canonicalRoot, "editorial", work.editorial_file);
  const source = readJson(editorialPath);
  const derivedFile = path.join(derivedEditorialRoot, work.editorial_file);
  const derived = readJson(derivedFile);
  if (JSON.stringify(record) !== JSON.stringify(derived)) fail(`${work.slug} registry/editorial divergence`);
  if (Object.keys(derived).some((key) => !allowedKeys.includes(key))) fail(`${work.slug} schema unknown field`);
  if (derived.canonicalTitle !== work.canonical_title || derived.canonicalTitle !== source.canonicalTitle) fail(`${work.slug} title mismatch`);
  if (derived.slug !== work.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(derived.slug)) fail(`${work.slug} slug mismatch`);
  if (titles.has(derived.canonicalTitle) || slugs.has(derived.slug)) fail(`${work.slug} duplicate identity`);
  titles.add(derived.canonicalTitle); slugs.add(derived.slug);
  if (derived.editorialStatus !== "LOCKED" || source.editorialStatus !== "LOCKED" || work.editorial_status !== "LOCKED") fail(`${work.slug} lock mismatch`);
  if (source.authorApproval !== "APPROVED" || work.author_approval !== "APPROVED") fail(`${work.slug} approval mismatch`);
  const pub = source.publicEditorial;
  const exactMappings = [
    ["editorialHook", pub.editorialHook ?? null],
    ["rightsSafeIntroduction", pub.rightsSafeIntroduction ?? null],
    ["themes", pub.themes],
    ["whyRead", pub.whyReadIt ?? null],
    ["readingExperience", Array.isArray(pub.readingExperience) ? pub.readingExperience.join("\n") : (pub.readingExperience ?? null)],
    ["biblicalCulturalNote", pub.biblicalCulturalNote ?? null],
    ["authorCreativeNote", pub.authorCreativeVision ?? null],
    ["publicationNote", pub.publicationNote ?? null],
    ["officialReadingCTA", pub.officialReadingCTA.text]
  ];
  for (const [key, expected] of exactMappings) if (JSON.stringify(derived[key]) !== JSON.stringify(expected)) fail(`${work.slug} editorial mapping changed ${key}`);
  if (pub.officialReadingCTA.mode !== "search-guidance" || pub.officialReadingCTA.verifiedUrl !== null || /https?:\/\//i.test(derived.officialReadingCTA)) fail(`${work.slug} unverified URL exposure`);
  for (const value of Object.values(source.rightsSafety)) if (value !== false) fail(`${work.slug} source rights flag non-zero`);
  const sourceKey = path.basename(work.editorial_file, ".json");
  const sourceCover = sourceCoverByKey.get(sourceKey);
  const derivedCover = derivedCoverByTitle.get(work.canonical_title);
  if (!sourceCover || !derivedCover) fail(`${work.slug} missing cover cross-reference`);
  if (derivedCover.verificationStatus !== "VERIFIED" || derivedCover.sha256 !== sourceCover.sha256 || derivedCover.rightsVerified !== true) fail(`${work.slug} cover verification mismatch`);
  const coverBytes = fs.readFileSync(path.join(canonicalRoot, "covers", sourceCover.asset));
  if (hash(coverBytes) !== sourceCover.sha256 || coverBytes.length !== sourceCover.bytes) fail(`${work.slug} physical cover mismatch`);
  if (derived.cover !== derivedCover.asset) fail(`${work.slug} editorial/cover path mismatch`);
  const canonicalVersion = work.canonical_version ?? source.canonicalVersion ?? null;
  if (work.canonical_title === "火没有降下来" && canonicalVersion !== "v3") fail("火没有降下来 is not v3");
  crossReferences.push({canonicalTitle: work.canonical_title, slug: work.slug, editorial: work.editorial_file, cover: sourceCover.asset, editorialStatus: "LOCKED", authorApproval: "APPROVED", canonicalVersion, status: "PASS"});
}

for (const excluded of ["为什么偏偏是我", "每个人都来安慰他"]) if (titles.has(excluded)) fail(`excluded title leaked: ${excluded}`);
if (sourceCoverByKey.size !== 12 || derivedCoverByTitle.size !== 12) fail("orphan or duplicate cover mapping");
const prohibitedExtensions = new Set([".doc", ".docx", ".pdf", ".txt"]);
const canonicalFiles = [];
const walk = (directory) => { for (const entry of fs.readdirSync(directory, {withFileTypes: true})) { const target = path.join(directory, entry.name); if (entry.isDirectory()) walk(target); else canonicalFiles.push(target); } };
walk(canonicalRoot);
if (canonicalFiles.some((file) => prohibitedExtensions.has(path.extname(file).toLowerCase()))) fail("prohibited source type in canonical package");
for (const publicRoot of [path.join(root, "public/fiction"), path.join(root, "content/fiction")]) if (fs.existsSync(publicRoot)) fail(`fiction intake leaked to public runtime: ${publicRoot}`);

console.log(JSON.stringify({
  status: "PASS",
  canonicalIdentities: "12/12",
  editorialPackages: "12/12",
  editorialStatus: "12/12 LOCKED",
  authorApproval: "12/12 APPROVED",
  coverMappings: "12/12",
  coverAssets: "12/12",
  fireDidNotFall: "v3 ONLY",
  canonicalHashes: "34/34",
  canonicalByteChanges: 0,
  schemaValidation: "PASS",
  crossReferenceAudit: "PASS",
  rightsPublicBoundaryAudit: "PASS",
  unverifiedUrls: 0,
  manuscriptExposure: 0,
  chapterExposure: 0,
  contractExposure: 0,
  internalRightsExposure: 0,
  falseHistoricalClaims: 0,
  crossReferences
}, null, 2));
