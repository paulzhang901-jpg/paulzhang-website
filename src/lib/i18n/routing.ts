import type { Route } from "next";
import type { Locale, MessageKey } from "@/config/i18n";

export const routeIds = [
  "home", "start", "library", "stories", "fiction", "together", "grow", "community",
  "about", "contact", "gccm", "search", "legal-privacy", "legal-terms",
] as const;

export type RouteId = (typeof routeIds)[number];

export type RouteDefinition = {
  id: RouteId;
  path: string;
  label: MessageKey;
  navigation?: boolean;
};

export const routes: readonly RouteDefinition[] = [
  {id: "home", path: "/", label: "siteName"},
  {id: "start", path: "/start", label: "start"},
  {id: "library", path: "/library", label: "library", navigation: true},
  {id: "stories", path: "/stories", label: "stories", navigation: true},
  {id: "fiction", path: "/fiction", label: "fiction", navigation: true},
  {id: "grow", path: "/grow", label: "grow", navigation: true},
  {id: "together", path: "/together", label: "together", navigation: true},
  {id: "community", path: "/community", label: "community", navigation: true},
  {id: "about", path: "/about", label: "about", navigation: true},
  {id: "contact", path: "/about/contact", label: "contact"},
  {id: "gccm", path: "/gccm", label: "gccm"},
  {id: "search", path: "/search", label: "search"},
  {id: "legal-privacy", path: "/legal/privacy", label: "privacy"},
  {id: "legal-terms", path: "/legal/terms", label: "terms"},
] as const;

export function getRoute(id: RouteId) {
  const route = routes.find((candidate) => candidate.id === id);
  if (!route) throw new Error(`Unknown route: ${id}`);
  return route;
}

export function localizedPath(id: RouteId, locale: Locale): Route {
  const path = getRoute(id).path;
  if (locale === "zh-CN") return path as Route;
  return (path === "/" ? "/en" : `/en${path}`) as Route;
}

export function resolveEnglishSegments(segments: string[] | undefined): RouteId | null {
  const path = `/${segments?.join("/") ?? ""}`.replace(/\/$/, "") || "/";
  return routes.find((route) => route.path === path)?.id ?? null;
}

export function alternateLocale(locale: Locale): Locale {
  return locale === "zh-CN" ? "en-US" : "zh-CN";
}
