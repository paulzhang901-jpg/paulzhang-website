import type { ContentWorkSource, ContentUnitFrontmatter } from "./schema";
import type { ContentUnit, ContentWork, ContentWorkRepresentation, PublicContentUnit, PublicWorkRepresentation } from "@/types/content-work";

export function normalizeWork(source: ContentWorkSource, sourcePath: string): ContentWork {
  return {
    id: source.id,
    canonicalId: source.canonical_id,
    workType: source.work_type,
    representations: source.representations.map((representation): ContentWorkRepresentation => ({
      language: representation.language,
      slug: representation.slug,
      status: representation.status,
      title: representation.title,
      subtitle: representation.subtitle,
      summary: representation.summary,
      authors: [...representation.authors],
      publishedAt: representation.published_at ? new Date(representation.published_at) : undefined,
      updatedAt: representation.updated_at ? new Date(representation.updated_at) : undefined,
      visibility: representation.visibility,
      accessLevel: representation.access_level,
      seo: {...representation.seo},
    })),
    units: source.units.map((unit) => ({canonicalId: unit.canonical_id, order: unit.order})),
    sourcePath,
  };
}

export function normalizeUnit(frontmatter: ContentUnitFrontmatter, body: string, sourcePath: string): ContentUnit {
  return {
    id: frontmatter.id,
    canonicalId: frontmatter.canonical_id,
    workCanonicalId: frontmatter.work_canonical_id,
    unitType: frontmatter.unit_type,
    order: frontmatter.order,
    chapterNumber: frontmatter.chapter_number,
    slug: frontmatter.slug,
    status: frontmatter.status,
    title: frontmatter.title,
    language: frontmatter.language,
    publishedAt: frontmatter.published_at ? new Date(frontmatter.published_at) : undefined,
    updatedAt: frontmatter.updated_at ? new Date(frontmatter.updated_at) : undefined,
    visibility: frontmatter.visibility,
    accessLevel: frontmatter.access_level,
    seo: {...frontmatter.seo},
    body,
    sourcePath,
  };
}

export function isPublicWorkRepresentation(representation: ContentWorkRepresentation): representation is PublicWorkRepresentation {
  return representation.status === "published" && representation.visibility === "public" && representation.accessLevel === "public" && representation.publishedAt instanceof Date;
}

export function isPublicContentUnit(unit: ContentUnit): unit is PublicContentUnit {
  return unit.status === "published" && unit.visibility === "public" && unit.accessLevel === "public" && unit.publishedAt instanceof Date;
}
