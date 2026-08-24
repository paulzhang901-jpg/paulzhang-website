export type ContentLanguage = "zh-CN" | "en-US";
export type ContentStatus = "draft" | "review" | "scheduled" | "published" | "archived";
export type ContentVisibility = "public" | "unlisted" | "private";
export type ContentAccessLevel = "public" | "member" | "mentor";
export type TranslationStatus = "missing" | "draft" | "review" | "published" | "outdated";
export type ContentDomain = "library" | "stories" | "growth" | "pages";

export type ScriptureReference = {
  book: string;
  chapterStart: number;
  verseStart?: number;
  chapterEnd?: number;
  verseEnd?: number;
};

export type ContentNextStep =
  | {type: "content"; target: string; label?: string}
  | {type: "action"; action: "reflect" | "practice" | "connect"; label: string};

export type NormalizedContentItem = {
  id: string;
  canonicalId: string;
  slug: string;
  domain: ContentDomain;
  language: ContentLanguage;
  status: ContentStatus;
  contentType: string;
  title: string;
  subtitle?: string;
  summary: string;
  topics: string[];
  lifeNeeds: string[];
  journeyStages: string[];
  audiences: string[];
  authors: string[];
  publishedAt: Date;
  updatedAt?: Date;
  visibility: ContentVisibility;
  accessLevel: ContentAccessLevel;
  scriptureRefs: ScriptureReference[];
  formation: {
    intent?: string;
    reflectionPrompts: string[];
    practices: string[];
    discussionQuestions: string[];
    prayerPrompt?: string;
    mentorPrompt?: string;
    nextSteps: ContentNextStep[];
  };
  relatedContent: string[];
  seo: {title?: string; description?: string};
  body: string;
  sourcePath: string;
};

export type SearchDocument = {
  id: string;
  canonical_id: string;
  slug: string;
  language: ContentLanguage;
  title: string;
  summary: string;
  plain_text_excerpt: string;
  content_type: string;
  topics: string[];
  life_needs: string[];
  journey_stages: string[];
  audiences: string[];
  published_at: string;
};

export type TranslationResolution =
  | {status: Exclude<TranslationStatus, "missing">; item: NormalizedContentItem}
  | {status: "missing"; item: null};
