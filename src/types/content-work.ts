import type { ContentAccessLevel, ContentLanguage, ContentStatus, ContentVisibility, TranslationStatus } from "./content";

export type ContentWorkRepresentation = {
  language: ContentLanguage;
  slug: string;
  status: ContentStatus;
  title: string;
  subtitle?: string;
  summary: string;
  authors: string[];
  publishedAt?: Date;
  updatedAt?: Date;
  visibility: ContentVisibility;
  accessLevel: ContentAccessLevel;
  seo: {title?: string; description?: string};
};

export type ContentWork = {
  id: string;
  canonicalId: string;
  workType: string;
  representations: ContentWorkRepresentation[];
  units: {canonicalId: string; order: number}[];
  sourcePath: string;
};

export type ContentUnit = {
  id: string;
  canonicalId: string;
  workCanonicalId: string;
  unitType: string;
  order: number;
  chapterNumber?: number;
  slug: string;
  status: ContentStatus;
  title: string;
  language: ContentLanguage;
  publishedAt?: Date;
  updatedAt?: Date;
  visibility: ContentVisibility;
  accessLevel: ContentAccessLevel;
  seo: {title?: string; description?: string};
  body: string;
  sourcePath: string;
};

export type PublicWorkRepresentation = ContentWorkRepresentation & {
  status: "published";
  visibility: "public";
  accessLevel: "public";
  publishedAt: Date;
};

export type PublicContentUnit = ContentUnit & {
  status: "published";
  visibility: "public";
  accessLevel: "public";
  publishedAt: Date;
};

export type WorkTranslationResolution =
  | {status: "published" | "outdated"; available: true; work: ContentWork; representation: PublicWorkRepresentation}
  | {status: TranslationStatus | "unavailable"; available: false; work: null; representation: null};

export type UnitTranslationResolution =
  | {status: "published" | "outdated"; available: true; work: ContentWork; workRepresentation: PublicWorkRepresentation; unit: PublicContentUnit}
  | {status: TranslationStatus | "unavailable"; available: false; work: null; workRepresentation: null; unit: null};
