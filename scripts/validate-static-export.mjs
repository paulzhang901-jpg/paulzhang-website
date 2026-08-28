import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "out");
const manifestPath = path.join(root, ".next", "prerender-manifest.json");
const placeholder = "__static-export-placeholder__";

function fail(message) { throw new Error(`STATIC_EXPORT_VALIDATION_FAILED: ${message}`); }
if (!fs.existsSync(output) || !fs.existsSync(manifestPath)) fail("missing static-export output");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const generatedRoutes = Object.keys(manifest.routes);
const placeholderRoutes = generatedRoutes.filter((route) => route.includes(placeholder));
const productionRoutes = generatedRoutes.filter((route) => !route.includes(placeholder));
if (productionRoutes.length !== 133) fail(`expected 133 production routes, found ${productionRoutes.length}`);
if (placeholderRoutes.length !== 2) fail(`expected two build-only empty-unit placeholders, found ${placeholderRoutes.length}`);

for (const localePrefix of ["", "en/"]) {
  const stories = path.join(output, localePrefix, "stories");
  for (const entry of fs.readdirSync(stories)) {
    if (entry.startsWith(`${placeholder}.`) || entry === placeholder) fs.rmSync(path.join(stories, entry), {recursive: true, force: true});
  }
}

const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target); else files.push(target);
  }
}
walk(output);

for (const file of files) {
  const bytes = fs.readFileSync(file);
  if (bytes.includes(Buffer.from(placeholder))) fail(`placeholder leaked into ${path.relative(output, file)}`);
}

const htmlFiles = files.filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  if (/\/_next\/image\?/.test(html)) fail(`runtime image optimizer URL in ${path.relative(output, file)}`);
}

for (const relative of ["404.html", "fiction.html", "en/fiction.html", "robots.txt", "sitemap.xml", "_headers"]) {
  if (!fs.existsSync(path.join(output, relative))) fail(`missing ${relative}`);
}

const registry = JSON.parse(fs.readFileSync(path.join(root, "config/fiction/intake/canonical-registry/registry.json"), "utf8"));
if (registry.works.length !== 12) fail(`expected 12 fiction works, found ${registry.works.length}`);
for (const work of registry.works) {
  for (const localePrefix of ["", "en/"]) {
    const relative = `${localePrefix}fiction/${work.slug}.html`;
    const htmlPath = path.join(output, relative);
    if (!fs.existsSync(htmlPath)) fail(`missing fiction route ${relative}`);
    const html = fs.readFileSync(htmlPath, "utf8");
    if (!html.includes(`https://paulzhang.org/${localePrefix}fiction/${work.slug}`)) fail(`missing canonical URL in ${relative}`);
    if (!html.includes('hrefLang="zh-CN"') || !html.includes('hrefLang="en-US"')) fail(`missing hreflang in ${relative}`);
    const cover = `/images/fiction/covers/${path.basename(work.cover)}`;
    if (!html.includes(cover) || !fs.existsSync(path.join(output, cover))) fail(`missing canonical cover binding in ${relative}`);
  }
}

const sitemap = fs.readFileSync(path.join(output, "sitemap.xml"), "utf8");
for (const work of registry.works) {
  for (const prefix of ["", "en/"]) if (!sitemap.includes(`https://paulzhang.org/${prefix}fiction/${work.slug}`)) fail(`sitemap missing ${prefix}fiction/${work.slug}`);
}
if (!fs.readFileSync(path.join(output, "robots.txt"), "utf8").includes("https://paulzhang.org/sitemap.xml")) fail("robots sitemap URL mismatch");

function resolvesPublicPath(urlPath) {
  if (urlPath === "/") return fs.existsSync(path.join(output, "index.html"));
  const decoded = decodeURI(urlPath.split("?")[0].split("#")[0]);
  const relative = decoded.replace(/^\//, "");
  return fs.existsSync(path.join(output, relative)) || fs.existsSync(path.join(output, `${relative}.html`)) || fs.existsSync(path.join(output, relative, "index.html"));
}

const brokenLinks = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/_next/") || href === "/favicon.ico") continue;
    if (!resolvesPublicPath(href)) brokenLinks.push({file: path.relative(output, file), href});
  }
}
if (brokenLinks.length) fail(`broken internal links: ${JSON.stringify(brokenLinks.slice(0, 10))}`);

const allText = htmlFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
for (const prohibited of ["config/fiction/intake", "PACKAGE-LOCK-MANIFEST", "publication-rights.yaml", "internal-rights", ".docx", "contract.pdf"]) {
  if (allText.toLowerCase().includes(prohibited.toLowerCase())) fail(`private/internal token exposed: ${prohibited}`);
}

const headers = fs.readFileSync(path.join(output, "_headers"), "utf8");
if (!headers.includes("X-Robots-Tag: noindex") || !headers.includes("/_next/static/*")) fail("preview noindex or immutable asset cache contract missing");

console.log(JSON.stringify({status: "PASS", productionRoutes: "133/133", buildOnlyPlaceholdersRemoved: "2/2", fictionRoutes: "12/12 zh-CN + 12/12 en-US", runtimeImageOptimizerUrls: 0, brokenInternalLinks: 0, canonicalAndHreflang: "PASS", sitemapAndRobots: "PASS", notFoundArtifact: "PASS", previewNoindexContract: "PASS", publicPrivateBoundary: "PASS"}, null, 2));
