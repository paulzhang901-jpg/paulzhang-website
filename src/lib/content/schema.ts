import { z } from "zod";
import { getTaxonomyRegistry } from "@/lib/taxonomy/registry";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a stable kebab-case slug");
const identifier = z.string().regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, "must be a stable machine identifier");

export const scriptureReferenceSchema = z.object({
  book: z.string().min(1),
  chapter_start: z.number().int().positive(),
  verse_start: z.number().int().positive().optional(),
  chapter_end: z.number().int().positive().optional(),
  verse_end: z.number().int().positive().optional(),
}).strict().superRefine((reference, context) => {
  if (reference.chapter_end !== undefined && reference.chapter_end < reference.chapter_start) {
    context.addIssue({code: "custom", message: "chapter_end cannot precede chapter_start"});
  }
  if (reference.verse_end !== undefined && reference.chapter_end === undefined) {
    context.addIssue({code: "custom", message: "verse_end requires chapter_end"});
  }
  if (reference.verse_end !== undefined && reference.verse_start === undefined) {
    context.addIssue({code: "custom", message: "verse_end requires verse_start"});
  }
  if (reference.chapter_end === reference.chapter_start && reference.verse_start && reference.verse_end && reference.verse_end < reference.verse_start) {
    context.addIssue({code: "custom", message: "verse_end cannot precede verse_start in the same chapter"});
  }
});

const nextStepSchema = z.discriminatedUnion("type", [
  z.object({type: z.literal("content"), target: identifier, label: z.string().min(1).optional()}).strict(),
  z.object({type: z.literal("action"), action: z.enum(["reflect", "practice", "connect"]), label: z.string().min(1)}).strict(),
]);

const commonFrontmatter = {
  id: identifier,
  canonical_id: identifier,
  slug,
  status: z.enum(["draft", "review", "scheduled", "published", "archived"]),
  title: z.string().min(1),
  subtitle: z.string().min(1).optional(),
  summary: z.string().min(1),
  content_type: identifier,
  language: z.enum(["zh-CN", "en-US"]),
  authors: z.array(z.string().min(1)).default([]),
  published_at: z.string().datetime({offset: true}).nullish(),
  updated_at: z.string().datetime({offset: true}).optional(),
  visibility: z.enum(["public", "unlisted", "private"]),
  access_level: z.enum(["public", "member", "mentor"]),
  scripture_refs: z.array(scriptureReferenceSchema).default([]),
  related_content: z.array(identifier).default([]),
  formation_intent: z.string().min(1).optional(),
  reflection_prompts: z.array(z.string().min(1)).default([]),
  practices: z.array(z.string().min(1)).default([]),
  discussion_questions: z.array(z.string().min(1)).default([]),
  prayer_prompt: z.string().min(1).optional(),
  mentor_prompt: z.string().min(1).optional(),
  next_steps: z.array(nextStepSchema).default([]),
  featured_image: z.record(z.string(), z.unknown()).optional(),
  media: z.array(z.unknown()).default([]),
  seo: z.object({title: z.string().min(1).optional(), description: z.string().min(1).optional()}).passthrough().default({}),
};

function publicationTimestampRule(item: {status: string; published_at?: string | null}, context: z.RefinementCtx) {
  if ((item.status === "published" || item.status === "archived") && !item.published_at) {
    context.addIssue({code: "custom", path: ["published_at"], message: `published_at is required when status is ${item.status}`});
  }
}

const legacyContentFrontmatterSchema = z.object({
  ...commonFrontmatter,
  topics: z.array(identifier).min(1),
  life_needs: z.array(identifier).default([]),
  journey_stages: z.array(identifier).default([]),
  audiences: z.array(identifier).default([]),
}).strict().superRefine(publicationTimestampRule);

const taxonomy = getTaxonomyRegistry();
const registered = (values: string[], label: string) => identifier.refine((value) => values.includes(value), `unknown ${label}`);

export const canonicalContentFrontmatterSchema = z.object({
  ...commonFrontmatter,
  schema_version: z.literal(2),
  content_type: registered(taxonomy.content_types, "content_type"),
  primary_topic: registered(taxonomy.primary_topics, "primary_topic"),
  secondary_topics: z.array(registered(taxonomy.topics, "secondary_topic")).default([]),
  growth_stages: z.array(registered(taxonomy.journey_stages, "growth_stage")).default([]),
  life_domains: z.array(registered(taxonomy.life_domains, "life_domain")).default([]),
  life_needs: z.array(registered(taxonomy.life_needs, "life_need")).default([]),
  audiences: z.array(registered(taxonomy.audiences, "audience")).default([]),
}).strict().superRefine(publicationTimestampRule);

export const contentFrontmatterSchema = z.union([canonicalContentFrontmatterSchema, legacyContentFrontmatterSchema]);

export type ContentFrontmatter = z.infer<typeof contentFrontmatterSchema>;
