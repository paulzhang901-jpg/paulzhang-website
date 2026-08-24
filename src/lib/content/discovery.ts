import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { contentFrontmatterSchema, type ContentFrontmatter } from "./schema";
import { validateMdxSource } from "./mdx-safety";
import { validateTaxonomy } from "@/lib/taxonomy/registry";
import type { ContentDomain, ContentLanguage } from "@/types/content";

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
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (/\.mdx?$/.test(entry.name)) files.push(target);
    }
  };
  visit(contentRoot);
  return files.sort();
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

  return {frontmatter, body: parsed.content.trim(), sourcePath: relative, domain: domainPart as ContentDomain};
}

export function discoverAndParseContent(contentRoot = path.join(process.cwd(), "content")) {
  return discoverContentFiles(contentRoot).map((file) => parseContentFile(file, contentRoot));
}
