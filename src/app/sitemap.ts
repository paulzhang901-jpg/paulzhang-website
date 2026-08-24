import type { MetadataRoute } from "next";
import { localizedPath, routes } from "@/lib/i18n/routing";
import { siteUrl } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.flatMap((route) => (["zh-CN", "en-US"] as const).map((locale) => ({
    url: new URL(localizedPath(route.id, locale), siteUrl).toString(),
    alternates: {languages: {
      "zh-CN": new URL(localizedPath(route.id, "zh-CN"), siteUrl).toString(),
      "en-US": new URL(localizedPath(route.id, "en-US"), siteUrl).toString(),
    }},
  })));
}
