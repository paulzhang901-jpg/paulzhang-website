export type FictionEditorialRecord = {
  canonicalTitle: string;
  slug: string;
  workType: string;
  collection: string;
  cover: string;
  editorialHook: string | null;
  rightsSafeIntroduction: string | null;
  themes: string[];
  whyRead: string | null;
  readingExperience: string | null;
  biblicalCulturalNote: string | null;
  authorCreativeNote: string | null;
  publicationNote: string | null;
  officialReadingCTA: string;
  rightsStatus: string;
  editorialVersion: string;
  editorialStatus: "LOCKED";
};

export type FictionCardRecord = Pick<FictionEditorialRecord, "canonicalTitle" | "slug" | "cover" | "editorialHook" | "themes">;
