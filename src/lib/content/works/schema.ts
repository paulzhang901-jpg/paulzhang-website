import { z } from "zod";

const identifier = z.string().regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, "must be a stable machine identifier");
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a stable kebab-case slug");
const status = z.enum(["draft", "review", "scheduled", "published", "archived"]);
const language = z.enum(["zh-CN", "en-US"]);
const visibility = z.enum(["public", "unlisted", "private"]);
const accessLevel = z.enum(["public", "member", "mentor"]);
const seo = z.object({title: z.string().min(1).optional(), description: z.string().min(1).optional()}).strict().default({});

function requirePublicationTimestamp(item: {status: z.infer<typeof status>; published_at?: string | null}, context: z.RefinementCtx) {
  if ((item.status === "published" || item.status === "archived") && !item.published_at) {
    context.addIssue({code: "custom", path: ["published_at"], message: `published_at is required when status is ${item.status}`});
  }
}

export const workRepresentationSchema = z.object({
  language,
  slug,
  status,
  title: z.string().min(1),
  subtitle: z.string().min(1).optional(),
  summary: z.string().min(1),
  authors: z.array(z.string().min(1)).default([]),
  published_at: z.string().datetime({offset: true}).nullish(),
  updated_at: z.string().datetime({offset: true}).optional(),
  visibility,
  access_level: accessLevel,
  seo,
}).strict().superRefine(requirePublicationTimestamp);

export const contentWorkSchema = z.object({
  id: identifier,
  canonical_id: identifier,
  work_type: identifier,
  representations: z.array(workRepresentationSchema).min(1),
  units: z.array(z.object({canonical_id: identifier, order: z.number().int().positive()}).strict()).min(1),
}).strict().superRefine((work, context) => {
  const locales = work.representations.map((representation) => representation.language);
  if (new Set(locales).size !== locales.length) context.addIssue({code: "custom", path: ["representations"], message: "duplicate locale representation"});
  const unitIds = work.units.map((unit) => unit.canonical_id);
  if (new Set(unitIds).size !== unitIds.length) context.addIssue({code: "custom", path: ["units"], message: "duplicate unit membership"});
  const orders = work.units.map((unit) => unit.order);
  if (new Set(orders).size !== orders.length) context.addIssue({code: "custom", path: ["units"], message: "duplicate unit order"});
  if (unitIds.includes(work.canonical_id)) context.addIssue({code: "custom", path: ["units"], message: "cyclic work/unit relationship"});
});

export const contentUnitFrontmatterSchema = z.object({
  id: identifier,
  canonical_id: identifier,
  work_canonical_id: identifier,
  unit_type: identifier,
  order: z.number().int().positive(),
  chapter_number: z.number().int().positive().optional(),
  slug,
  status,
  title: z.string().min(1),
  language,
  published_at: z.string().datetime({offset: true}).nullish(),
  updated_at: z.string().datetime({offset: true}).optional(),
  visibility,
  access_level: accessLevel,
  seo,
}).strict().superRefine((unit, context) => {
  requirePublicationTimestamp(unit, context);
  if (unit.canonical_id === unit.work_canonical_id) context.addIssue({code: "custom", path: ["work_canonical_id"], message: "cyclic work/unit relationship"});
});

export type ContentWorkSource = z.infer<typeof contentWorkSchema>;
export type ContentUnitFrontmatter = z.infer<typeof contentUnitFrontmatterSchema>;
