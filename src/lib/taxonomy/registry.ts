import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const registrySchema = z.object({
  version: z.literal(1),
  content_types: z.array(z.string()).min(1),
  topics: z.array(z.string()).min(1),
  life_needs: z.array(z.string()).min(1),
  journey_stages: z.array(z.string()).min(1),
  audiences: z.array(z.string()).min(1),
}).strict();

export type TaxonomyRegistry = z.infer<typeof registrySchema>;
let cachedRegistry: TaxonomyRegistry | undefined;

export function getTaxonomyRegistry(): TaxonomyRegistry {
  if (cachedRegistry) return cachedRegistry;
  const file = path.join(process.cwd(), "config/architecture/taxonomy.yaml");
  cachedRegistry = registrySchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
  return cachedRegistry;
}

export function validateTaxonomy(frontmatter: {
  content_type: string; topics: string[]; life_needs: string[]; journey_stages: string[]; audiences: string[];
}) {
  const registry = getTaxonomyRegistry();
  const checks = [
    ["content_type", [frontmatter.content_type], registry.content_types],
    ["topic", frontmatter.topics, registry.topics],
    ["life_need", frontmatter.life_needs, registry.life_needs],
    ["journey_stage", frontmatter.journey_stages, registry.journey_stages],
    ["audience", frontmatter.audiences, registry.audiences],
  ] as const;
  const errors: string[] = [];
  for (const [dimension, values, allowed] of checks) {
    for (const value of values) if (!allowed.includes(value)) errors.push(`unknown ${dimension}: ${value}`);
  }
  return errors;
}
