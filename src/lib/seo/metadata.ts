import type { Metadata } from "next";
import { getMessages, type Locale } from "@/config/i18n";
import { getRoute, localizedPath, type RouteId } from "@/lib/i18n/routing";
import { getProductCopy, journeyPath, type JourneyId } from "@/config/product";

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
      canonical: new URL(path, siteUrl),
      languages: {
        "zh-CN": new URL(localizedPath(routeId, "zh-CN"), siteUrl),
        "en-US": new URL(localizedPath(routeId, "en-US"), siteUrl),
      },
    },
    openGraph: {title, description: copy.siteDescription, locale},
  };
}

export function metadataForJourney(journeyId: JourneyId, locale: Locale): Metadata {
  const copy = getProductCopy(locale);
  const path = journeyPath(journeyId, locale);
  const title = copy.journeys[journeyId];
  return {title, description: copy.start.helper, alternates: {canonical: new URL(path, siteUrl), languages: {"zh-CN": new URL(journeyPath(journeyId, "zh-CN"), siteUrl), "en-US": new URL(journeyPath(journeyId, "en-US"), siteUrl)}}};
}

export { siteUrl };
