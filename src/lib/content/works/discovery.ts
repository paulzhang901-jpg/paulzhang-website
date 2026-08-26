import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { validateMdxSource } from "@/lib/content/mdx-safety";
import { normalizeUnit, normalizeWork } from "./normalize";
import { contentUnitFrontmatterSchema, contentWorkSchema } from "./schema";
import type { ContentUnit, ContentWork } from "@/types/content-work";

export function discoverContentWorkFiles(root = path.join(process.cwd(), "content", "works")) {
  const manifests: string[] = [];
  const units: string[] = [];
  if (!fs.existsSync(root)) return {manifests, units};
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(target);
      else if (entry.name === "work.json") manifests.push(target);
      else if (/\.mdx?$/.test(entry.name)) units.push(target);
    }
  };
  visit(root);
  return {manifests: manifests.sort(), units: units.sort()};
}

export function discoverAndParseContentWorks(root = path.join(process.cwd(), "content", "works")): {works: ContentWork[]; units: ContentUnit[]} {
  const files = discoverContentWorkFiles(root);
  const works = files.manifests.map((file) => normalizeWork(contentWorkSchema.parse(JSON.parse(fs.readFileSync(file, "utf8"))), path.relative(process.cwd(), file)));
  const units = files.units.map((file) => {
    const parsed = matter(fs.readFileSync(file, "utf8"));
    const frontmatter = contentUnitFrontmatterSchema.parse(parsed.data);
    const body = parsed.content.trim();
    if (!body) throw new Error(`${path.relative(process.cwd(), file)}: content unit body is empty`);
    const mdxErrors = validateMdxSource(body);
    if (mdxErrors.length) throw new Error(`${path.relative(process.cwd(), file)}: ${mdxErrors.join("; ")}`);
    return normalizeUnit(frontmatter, body, path.relative(process.cwd(), file));
  });
  return {works, units};
}
