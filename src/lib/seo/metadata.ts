import type { Metadata } from "next";
import { getMessages, type Locale } from "@/config/i18n";
import { getRoute, localizedPath, type RouteId } from "@/lib/i18n/routing";
import { getProductCopy, journeyPath, type JourneyId } from "@/config/product";
import { aboutSectionCopy, type AboutSectionId } from "@/lib/about";

const siteUrl = new URL("https://paulzhang.org");

export function metadataForRoute(routeId: RouteId, locale: Locale): Metadata {
  const copy = getMessages(locale);
  const route = getRoute(routeId);
  const title = routeId === "home" ? copy.siteName : copy[route.label];
  const path = localizedPath(routeId, locale);

  return {
    title: routeId === "home" ? {absolute: title} : title,
    description: copy.siteDescription,
    alternates: {
      canonical: new URL(path, siteUrl).toString(),
      languages: {
        "zh-CN": new URL(localizedPath(routeId, "zh-CN"), siteUrl).toString(),
        "en-US": new URL(localizedPath(routeId, "en-US"), siteUrl).toString(),
      },
    },
    openGraph: {title, description: copy.siteDescription, locale},
  };
}

export function metadataForCollectionRoute(
  routeId: Extract<RouteId, "library" | "stories" | "grow" | "together" | "community" | "about" | "journey">,
  slug: string,
  locale: Locale,
): Metadata {
  const metadata = metadataForRoute(routeId, locale);
  const routePath = localizedPath(routeId, locale);
  const zhPath = `${localizedPath(routeId, "zh-CN")}/${slug}`;
  const enPath = `${localizedPath(routeId, "en-US")}/${slug}`;

  return {
    ...metadata,
    alternates: {
      canonical: new URL(`${routePath}/${slug}`, siteUrl).toString(),
      languages: {
        "zh-CN": new URL(zhPath, siteUrl).toString(),
        "en-US": new URL(enPath, siteUrl).toString(),
      },
    },
  };
}

export function metadataForAboutSection(section: AboutSectionId, locale: Locale): Metadata {
  const metadata = metadataForCollectionRoute("about", section, locale);
  const copy = aboutSectionCopy(locale, section);
  if (!copy.seoDescription) return metadata;
  return {
    ...metadata,
    title: copy.label,
    description: copy.seoDescription,
    openGraph: {...metadata.openGraph, title: copy.label, description: copy.seoDescription},
  };
}

export function metadataForJourney(journeyId: JourneyId, locale: Locale): Metadata {
  const copy = getProductCopy(locale);
  const path = journeyPath(journeyId, locale);
  const title = copy.journeys[journeyId];
  return {title, description: copy.start.helper, alternates: {canonical: new URL(path, siteUrl).toString(), languages: {"zh-CN": new URL(journeyPath(journeyId, "zh-CN"), siteUrl).toString(), "en-US": new URL(journeyPath(journeyId, "en-US"), siteUrl).toString()}}};
}

export { siteUrl };
