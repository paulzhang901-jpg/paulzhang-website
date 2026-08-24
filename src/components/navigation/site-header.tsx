import Link from "next/link";
import { Container } from "@/components/layout/container";
import { getMessages, type Locale } from "@/config/i18n";
import { localizedPath, routes } from "@/lib/i18n/routing";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader({locale}: {locale: Locale}) {
  const copy = getMessages(locale);
  const navigation = routes.filter((route) => route.navigation);

  return <header className="border-b bg-background/95">
    <Container className="flex min-h-18 items-center justify-between gap-4 py-3">
      <Link href={localizedPath("home", locale)} className="font-serif text-xl font-semibold">{copy.siteName}</Link>
      <nav aria-label={locale === "zh-CN" ? "主要导航" : "Primary navigation"} className="hidden lg:block">
        <ul className="flex items-center gap-1">
          {navigation.map((route) => <li key={route.id}>
            <Link className="inline-flex min-h-11 items-center rounded-md px-3 text-sm hover:bg-muted" href={localizedPath(route.id, locale)}>{copy[route.label]}</Link>
          </li>)}
        </ul>
      </nav>
      <div className="flex items-center gap-2">
        <Link className="hidden min-h-11 items-center rounded-md px-3 text-sm hover:bg-muted sm:inline-flex" href={localizedPath("search", locale)}>{copy.search}</Link>
        <LanguageSwitcher locale={locale} />
        <details className="relative lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-md border bg-surface px-3 text-sm font-medium">{copy.menu}</summary>
          <nav aria-label={locale === "zh-CN" ? "移动导航" : "Mobile navigation"} className="absolute right-0 z-20 mt-2 w-64 rounded-lg border bg-surface p-3 shadow-[var(--shadow-soft)]">
            <ul>{navigation.map((route) => <li key={route.id}><Link className="block rounded-md px-3 py-3 hover:bg-muted" href={localizedPath(route.id, locale)}>{copy[route.label]}</Link></li>)}</ul>
          </nav>
        </details>
      </div>
    </Container>
  </header>;
}
