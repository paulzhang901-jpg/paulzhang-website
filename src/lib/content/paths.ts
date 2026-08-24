import type { ContentDomain, ContentLanguage, NormalizedContentItem } from "@/types/content";

const domainSegments: Record<ContentDomain, string> = {
  library: "library",
  stories: "stories",
  growth: "grow",
  pages: "",
};

export function contentPath(item: Pick<NormalizedContentItem, "domain" | "slug" | "language">) {
  const localePrefix = item.language === "en-US" ? "/en" : "";
  const domain = domainSegments[item.domain];
  return `${localePrefix}/${domain ? `${domain}/` : ""}${item.slug}`;
}

export function localeName(locale: ContentLanguage) {
  return locale === "zh-CN" ? "中文" : "English";
}
