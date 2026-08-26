import type { MetadataRoute } from "next";
import { localizedPath, routes } from "@/lib/i18n/routing";
import { siteUrl } from "@/lib/seo/metadata";
import { journeyIds, journeyPath } from "@/config/product";
import { getContentWorkRepository } from "@/lib/content/works/repository";
import { unitPath, workPath } from "@/lib/content/works/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routeEntries = routes.flatMap((route) => (["zh-CN", "en-US"] as const).map((locale) => ({
    url: new URL(localizedPath(route.id, locale), siteUrl).toString(),
    alternates: {languages: {
      "zh-CN": new URL(localizedPath(route.id, "zh-CN"), siteUrl).toString(),
      "en-US": new URL(localizedPath(route.id, "en-US"), siteUrl).toString(),
    }},
  })));
  const journeyEntries = journeyIds.flatMap((journey) => (["zh-CN", "en-US"] as const).map((locale) => ({url: new URL(journeyPath(journey, locale), siteUrl).toString(), alternates: {languages: {"zh-CN": new URL(journeyPath(journey, "zh-CN"), siteUrl).toString(), "en-US": new URL(journeyPath(journey, "en-US"), siteUrl).toString()}}})));
  const repository = await getContentWorkRepository();
  const workEntries = (["zh-CN", "en-US"] as const).flatMap((locale) => repository.getPublishedWorks(locale).flatMap(({work, representation}) => [
    {url: new URL(workPath(representation.slug, locale), siteUrl).toString()},
    ...repository.getOrderedUnits(work.canonicalId, locale).map((unit) => ({url: new URL(unitPath(representation.slug, unit.slug, locale), siteUrl).toString()})),
  ]));
  return [...routeEntries, ...journeyEntries, ...workEntries];
}
