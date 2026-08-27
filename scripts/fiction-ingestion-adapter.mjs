import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const repositoryRoot = process.cwd();
const canonicalRoot = path.join(repositoryRoot, "config/fiction/intake/mu-changke-fiction-canonical-package-v1-final");
const registryOutput = path.join(repositoryRoot, "config/fiction/intake/canonical-registry/registry.json");
const editorialOutput = path.join(repositoryRoot, "config/fiction/intake/editorial-packages");
const coverOutput = path.join(repositoryRoot, "config/fiction/intake/covers/manifest.json");
const derivationOutput = path.join(repositoryRoot, "config/fiction/intake/DERIVATION-MANIFEST.json");
const marker = "DERIVED_FROM_LOCKED_CANONICAL_PACKAGE";

function fail(message) {
  throw new Error(message);
}

function readText(relative) {
  return fs.readFileSync(path.join(canonicalRoot, relative), "utf8");
}

function readJson(relative) {
  return JSON.parse(readText(relative));
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function verifyCanonicalHashes() {
  const lock = readJson("PACKAGE-LOCK-MANIFEST.json");
  const results = Object.entries(lock.files).map(([relative, expected]) => {
    const target = path.join(canonicalRoot, relative);
    if (!fs.existsSync(target)) fail(`missing protected file ${relative}`);
    const bytes = fs.readFileSync(target);
    const actualSha256 = sha256(bytes);
    if (bytes.length !== expected.bytes) fail(`byte mismatch ${relative}`);
    if (actualSha256 !== expected.sha256) fail(`hash mismatch ${relative}`);
    return {path: relative, bytes: bytes.length, sha256: actualSha256};
  });
  if (results.length !== lock.fileCount) fail(`lock count mismatch ${results.length}/${lock.fileCount}`);
  return {lock, results};
}

function yamlScalar(raw) {
  const value = raw.trim();
  if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) return value.slice(1, -1);
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  return value;
}

function parseWorksYaml(text) {
  const works = [];
  let current;
  for (const line of text.split(/\r?\n/)) {
    const item = line.match(/^- ([a-z_]+):\s*(.*)$/);
    if (item) {
      current = {[item[1]]: yamlScalar(item[2])};
      works.push(current);
      continue;
    }
    const field = line.match(/^  ([a-z_]+):\s*(.*)$/);
    if (field && current) current[field[1]] = yamlScalar(field[2]);
  }
  return works;
}

function requiredYamlValue(text, key) {
  const expression = new RegExp(`^\\s*${key}:\\s*(.+?)\\s*$`, "m");
  const match = text.match(expression);
  if (!match) fail(`missing YAML key ${key}`);
  return yamlScalar(match[1]);
}

function assertExactKeys(record, allowed, label) {
  const unknown = Object.keys(record).filter((key) => !allowed.includes(key));
  if (unknown.length) fail(`${label} contains unknown keys: ${unknown.join(", ")}`);
}

function validateDerivedEditorial(record) {
  const allowed = ["canonicalTitle", "slug", "workType", "collection", "cover", "editorialHook", "rightsSafeIntroduction", "themes", "whyRead", "readingExperience", "biblicalCulturalNote", "authorCreativeNote", "publicationNote", "officialReadingCTA", "rightsStatus", "editorialVersion", "editorialStatus"];
  assertExactKeys(record, allowed, record.slug);
  for (const key of ["canonicalTitle", "slug", "workType", "collection", "cover", "officialReadingCTA", "rightsStatus", "editorialVersion", "editorialStatus"]) {
    if (typeof record[key] !== "string" || !record[key]) fail(`${record.slug} invalid ${key}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) fail(`${record.slug} invalid slug`);
  if (record.editorialStatus !== "LOCKED") fail(`${record.slug} is not LOCKED`);
  if (!Array.isArray(record.themes) || record.themes.some((value) => typeof value !== "string" || !value)) fail(`${record.slug} invalid themes`);
  for (const key of ["editorialHook", "rightsSafeIntroduction", "whyRead", "readingExperience", "biblicalCulturalNote", "authorCreativeNote", "publicationNote"]) {
    if (record[key] !== null && typeof record[key] !== "string") fail(`${record.slug} invalid optional field ${key}`);
  }
}

const pre = verifyCanonicalHashes();
const canonicalYaml = readText("canonical.yaml");
const works = parseWorksYaml(readText("works.yaml"));
const approvalYaml = readText("editorial-approval-record.yaml");
const rightsYaml = readText("publication-rights.yaml");
const mediaYaml = readText("media-ledger.yaml");
const executionYaml = readText("execution-contract.yaml");
const coverManifest = readJson("covers/manifest.json");

if (requiredYamlValue(canonicalYaml, "status") !== "LOCKED") fail("canonical package is not LOCKED");
if (requiredYamlValue(canonicalYaml, "codex_ready") !== true) fail("canonical package is not Codex-ready");
if (requiredYamlValue(approvalYaml, "author_approval") !== "APPROVED") fail("author approval missing");
if (requiredYamlValue(approvalYaml, "all_public_packages") !== "LOCKED") fail("public package lock missing");
if (requiredYamlValue(rightsYaml, "website_role") !== "AUTHOR_PORTFOLIO_EDITORIAL_DISCOVERY_LAYER") fail("rights role mismatch");
for (const key of ["manuscripts", "chapters", "contracts", "internal_rights_analysis", "unverified_official_urls"]) {
  if (requiredYamlValue(rightsYaml, key) !== false) fail(`public boundary permits ${key}`);
}
if (requiredYamlValue(mediaYaml, "expected_cover_count") !== "12" || requiredYamlValue(mediaYaml, "physical_cover_count") !== "12" || requiredYamlValue(mediaYaml, "mapping_status") !== "VERIFIED") fail("media ledger mismatch");
if (requiredYamlValue(executionYaml, "implementation_only") !== true || requiredYamlValue(executionYaml, "may_rewrite_editorial_content") !== false || requiredYamlValue(executionYaml, "may_invent_publication_url") !== false) fail("execution boundary mismatch");
if (works.length !== 12) fail(`expected 12 works, found ${works.length}`);
if (coverManifest.expected !== 12 || coverManifest.physical !== 12 || coverManifest.status !== "VERIFIED" || coverManifest.mappings.length !== 12) fail("cover manifest count/status mismatch");

const coverByKey = new Map(coverManifest.mappings.map((mapping) => [mapping.key, mapping]));
const seenTitles = new Set();
const seenSlugs = new Set();
const derivedWorks = [];
const derivedCoverEntries = [];
const sourceMappings = [];

for (const work of works) {
  const ordinal = String(work.ordinal).padStart(2, "0");
  if (seenTitles.has(work.canonical_title)) fail(`duplicate title ${work.canonical_title}`);
  if (seenSlugs.has(work.slug)) fail(`duplicate slug ${work.slug}`);
  seenTitles.add(work.canonical_title);
  seenSlugs.add(work.slug);
  if (work.editorial_status !== "LOCKED") fail(`${work.slug} work record is not LOCKED`);
  if (work.author_approval !== "APPROVED") fail(`${work.slug} work record lacks approval`);

  const editorialRelative = `editorial/${work.editorial_file}`;
  const editorial = readJson(editorialRelative);
  if (editorial.canonicalTitle !== work.canonical_title) fail(`${work.slug} title mismatch`);
  if (editorial.editorialStatus !== "LOCKED") fail(`${work.slug} editorial package is not LOCKED`);
  if (editorial.authorApproval !== "APPROVED") fail(`${work.slug} editorial package lacks approval`);
  if (editorial.author !== "牧长客") fail(`${work.slug} author mismatch`);
  if (!editorial.publicEditorial || !editorial.rightsSafety) fail(`${work.slug} missing public editorial or rights safety`);
  for (const [key, value] of Object.entries(editorial.rightsSafety)) if (value !== false) fail(`${work.slug} rights safety ${key} is not false`);
  const cta = editorial.publicEditorial.officialReadingCTA;
  if (!cta || cta.mode !== "search-guidance" || typeof cta.text !== "string" || !cta.text || cta.verifiedUrl !== null) fail(`${work.slug} invalid or unverified CTA`);

  const sourceKey = path.basename(work.editorial_file, ".json");
  if (!sourceKey.startsWith(`${ordinal}-`)) fail(`${work.slug} ordinal/editorial mismatch`);
  const cover = coverByKey.get(sourceKey);
  if (!cover) fail(`${work.slug} missing cover mapping`);
  const coverRelative = `covers/${cover.asset}`;
  const coverPath = path.join(canonicalRoot, coverRelative);
  if (!fs.existsSync(coverPath)) fail(`${work.slug} missing cover asset`);
  const coverBytes = fs.readFileSync(coverPath);
  if (coverBytes.length !== cover.bytes || sha256(coverBytes) !== cover.sha256) fail(`${work.slug} cover hash mismatch`);

  const canonicalVersion = work.canonical_version ?? editorial.canonicalVersion ?? null;
  if (work.canonical_title === "火没有降下来" && canonicalVersion !== "v3") fail("火没有降下来 must be v3");
  if (work.canonical_title !== "火没有降下来" && canonicalVersion === "v1") fail(`${work.slug} unexpected superseded version`);

  const publicEditorial = editorial.publicEditorial;
  const derived = {
    canonicalTitle: work.canonical_title,
    slug: work.slug,
    workType: "fiction",
    collection: "mu-changke-fiction",
    cover: `mu-changke-fiction-canonical-package-v1-final/${coverRelative}`,
    editorialHook: publicEditorial.editorialHook ?? null,
    rightsSafeIntroduction: publicEditorial.rightsSafeIntroduction ?? null,
    themes: publicEditorial.themes,
    whyRead: publicEditorial.whyReadIt ?? null,
    readingExperience: Array.isArray(publicEditorial.readingExperience) ? publicEditorial.readingExperience.join("\n") : (publicEditorial.readingExperience ?? null),
    biblicalCulturalNote: publicEditorial.biblicalCulturalNote ?? null,
    authorCreativeNote: publicEditorial.authorCreativeVision ?? null,
    publicationNote: publicEditorial.publicationNote ?? null,
    officialReadingCTA: cta.text,
    rightsStatus: "AUTHOR_PORTFOLIO_EDITORIAL_DISCOVERY_LAYER",
    editorialVersion: editorial.editorialVersion ?? editorial.edition,
    editorialStatus: editorial.editorialStatus
  };
  validateDerivedEditorial(derived);
  derivedWorks.push(derived);
  derivedCoverEntries.push({
    canonicalTitle: work.canonical_title,
    asset: `mu-changke-fiction-canonical-package-v1-final/${coverRelative}`,
    verificationStatus: "VERIFIED",
    sha256: cover.sha256,
    altText: `《${work.canonical_title}》封面`,
    rightsVerified: true
  });
  sourceMappings.push({
    canonicalTitle: work.canonical_title,
    slug: work.slug,
    sourceWork: "works.yaml",
    sourceEditorial: editorialRelative,
    sourceCover: coverRelative,
    canonicalVersion
  });
}

if (coverByKey.size !== 12) fail("orphan or duplicate cover mapping");
const derivedRegistry = {registryName: "Mu Changke Fiction Editorial Registry", registryVersion: "1.0", author: "牧长客", works: derivedWorks};
const derivedCoverManifest = {version: 1, entries: derivedCoverEntries};

fs.mkdirSync(path.dirname(registryOutput), {recursive: true});
fs.mkdirSync(editorialOutput, {recursive: true});
fs.mkdirSync(path.dirname(coverOutput), {recursive: true});
fs.writeFileSync(registryOutput, `${JSON.stringify(derivedRegistry, null, 2)}\n`);
for (let index = 0; index < derivedWorks.length; index += 1) {
  const sourceName = works[index].editorial_file;
  fs.writeFileSync(path.join(editorialOutput, sourceName), `${JSON.stringify(derivedWorks[index], null, 2)}\n`);
}
fs.writeFileSync(coverOutput, `${JSON.stringify(derivedCoverManifest, null, 2)}\n`);

const outputFiles = [registryOutput, ...works.map((work) => path.join(editorialOutput, work.editorial_file)), coverOutput];
const derivationManifest = {
  status: marker,
  canonicalPackage: "mu-changke-fiction-canonical-package-v1",
  canonicalLockStatus: pre.lock.lockStatus,
  canonicalProtectedFiles: pre.results.length,
  mappingRules: {
    identityAndSlug: "works.yaml",
    editorialCopy: "editorial/*.json publicEditorial fields copied without prose rewriting; readingExperience array items retain exact text and are joined by newline separators for the repository string field",
    editorialVersion: "editorialVersion, falling back to the author-approved edition field",
    workType: "fixed repository implementation metadata: fiction",
    collection: "fixed repository implementation metadata: mu-changke-fiction",
    cover: "covers/manifest.json key equals locked editorial filename basename",
    coverAltText: "deterministic accessibility label from exact canonical title",
    rightsStatus: "publication-rights.yaml website_role",
    cta: "officialReadingCTA.text copied exactly; verifiedUrl must remain null"
  },
  sourceMappings,
  derivedOutputs: outputFiles.map((file) => {
    const bytes = fs.readFileSync(file);
    return {path: path.relative(repositoryRoot, file), bytes: bytes.length, sha256: sha256(bytes), authority: marker};
  })
};
fs.writeFileSync(derivationOutput, `${JSON.stringify(derivationManifest, null, 2)}\n`);

const post = verifyCanonicalHashes();
for (let index = 0; index < pre.results.length; index += 1) {
  if (pre.results[index].sha256 !== post.results[index].sha256 || pre.results[index].bytes !== post.results[index].bytes) fail(`canonical byte change ${pre.results[index].path}`);
}

console.log(JSON.stringify({
  status: "PASS",
  marker,
  preAdapterHashes: `${pre.results.length}/${pre.lock.fileCount}`,
  postAdapterHashes: `${post.results.length}/${post.lock.fileCount}`,
  canonicalByteChanges: 0,
  derivedWorks: derivedWorks.length,
  derivedEditorialPackages: derivedWorks.length,
  derivedCoverMappings: derivedCoverEntries.length,
  derivedOutputs: derivationManifest.derivedOutputs.length
}, null, 2));
