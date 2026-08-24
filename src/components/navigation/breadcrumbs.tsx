import Link from "next/link";
import { getMessages, type Locale } from "@/config/i18n";
import { getRoute, localizedPath, type RouteId } from "@/lib/i18n/routing";

export function Breadcrumbs({locale, routeId}: {locale: Locale; routeId: RouteId}) {
  if (routeId === "home") return null;
  const copy = getMessages(locale);
  const route = getRoute(routeId);
  return <nav aria-label={locale === "zh-CN" ? "面包屑" : "Breadcrumbs"} className="mb-6 text-sm text-muted-foreground">
    <ol className="flex items-center gap-2">
      <li><Link href={localizedPath("home", locale)}>{copy.siteName}</Link></li>
      <li aria-hidden="true">/</li>
      <li aria-current="page">{copy[route.label]}</li>
    </ol>
  </nav>;
}
