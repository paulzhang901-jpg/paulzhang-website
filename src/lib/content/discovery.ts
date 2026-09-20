import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { contentFrontmatterSchema, type ContentFrontmatter } from "./schema";
import { validateMdxSource } from "./mdx-safety";
import { validateTaxonomy } from "@/lib/taxonomy/registry";
import type { ContentDomain, ContentLanguage } from "@/types/content";
import { canonicalContentPath } from "./normalize";

export type ParsedContentRecord = {
  frontmatter: ContentFrontmatter;
  body: string;
  sourcePath: string;
  domain: ContentDomain;
};

const validDomains = new Set<ContentDomain>(["library", "stories", "growth", "pages"]);

export function discoverContentFiles(contentRoot = path.join(process.cwd(), "content")): string[] {
  if (!fs.existsSync(contentRoot)) return [];
  const files: string[] = [];
  const resolvedContentRoot = path.resolve(contentRoot);
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory() && path.resolve(directory) === resolvedContentRoot && entry.name === "works") continue;
      if (entry.isDirectory()) visit(target);
      else if (/\.mdx?$/.test(entry.name) && !isProtectedUnpublishedSermonRuntimePath(target)) files.push(target);
    }
  };
  visit(contentRoot);
  return files.sort();
}

function isProtectedUnpublishedSermonRuntimePath(filePath: string) {
  const registryPath = path.join(process.cwd(), "config/content/sermons/publication-registry.yaml");
  if (!fs.existsSync(registryPath)) return false;
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as {records?: Array<{
    runtimeContentPath?: string; publicationStatus: string; humanPreviewStatus: string; searchEligibility: boolean;
  }>};
  const projectRelative = path.relative(process.cwd(), filePath).split(path.sep).join("/");
  const record = registry.records?.find((entry) => entry.runtimeContentPath === projectRelative);
  return Boolean(record && (
    record.publicationStatus !== "PUBLISHED" ||
    record.humanPreviewStatus !== "APPROVED" ||
    record.searchEligibility !== true
  ));
}

export function parseContentFile(filePath: string, contentRoot = path.join(process.cwd(), "content")): ParsedContentRecord {
  const relative = path.relative(contentRoot, filePath);
  const [localePart, domainPart] = relative.split(path.sep);
  if (!(["zh-CN", "en-US"] as string[]).includes(localePart)) throw new Error(`${relative}: invalid locale folder`);
  if (!validDomains.has(domainPart as ContentDomain)) throw new Error(`${relative}: invalid content domain`);

  const parsed = matter(fs.readFileSync(filePath, "utf8"));
  const frontmatter = contentFrontmatterSchema.parse(parsed.data);
  if (frontmatter.language !== localePart as ContentLanguage) throw new Error(`${relative}: language does not match locale folder`);
  if (!parsed.content.trim()) throw new Error(`${relative}: content body is empty`);
  const taxonomyErrors = validateTaxonomy(frontmatter);
  const mdxErrors = validateMdxSource(parsed.content);
  if (taxonomyErrors.length || mdxErrors.length) throw new Error(`${relative}: ${[...taxonomyErrors, ...mdxErrors].join("; ")}`);
  assertProtectedOrdinaryContent(frontmatter, domainPart as ContentDomain);

  return {frontmatter, body: parsed.content.trim(), sourcePath: relative, domain: domainPart as ContentDomain};
}

function assertProtectedOrdinaryContent(frontmatter: ContentFrontmatter, domain: ContentDomain) {
  if (frontmatter.content_type !== "sermon") return;
  const registryPath = path.join(process.cwd(), "config/content/sermons/publication-registry.yaml");
  if (!fs.existsSync(registryPath)) throw new Error(`${frontmatter.id}: protected sermon publication registry is unavailable`);
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as {records?: Array<{
    sermonId: string; publicationStatus: string; humanPreviewStatus: string; runtimeContentPath?: string;
    publicRoute: string | null; searchEligibility: boolean;
  }>};
  const record = registry.records?.find((entry) => entry.sermonId === frontmatter.id);
  const expectedRoute = canonicalContentPath(domain, frontmatter.slug, frontmatter.language);
  if (!record || record.publicationStatus !== "PUBLISHED" || record.humanPreviewStatus !== "APPROVED" ||
      record.searchEligibility !== true || record.publicRoute !== expectedRoute) {
    throw new Error(`${frontmatter.id}: protected sermon eligibility gate failed`);
  }
  const expectedRuntimePath = `content/${frontmatter.language}/${domain}/${frontmatter.slug}.mdx`;
  if (record.runtimeContentPath !== expectedRuntimePath) {
    throw new Error(`${frontmatter.id}: protected sermon runtime path gate failed`);
  }
}

export function discoverAndParseContent(contentRoot = path.join(process.cwd(), "content")) {
  return discoverContentFiles(contentRoot).map((file) => parseContentFile(file, contentRoot));
}
