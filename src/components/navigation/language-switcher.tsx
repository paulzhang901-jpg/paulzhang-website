"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { getMessages, type Locale } from "@/config/i18n";
import { alternateLocale } from "@/lib/i18n/routing";

export function LanguageSwitcher({locale}: {locale: Locale}) {
  const targetLocale = alternateLocale(locale);
  const copy = getMessages(locale);
  const pathname = usePathname();
  const targetPath = (locale === "zh-CN"
    ? pathname === "/" ? "/en" : `/en${pathname}`
    : pathname === "/en" ? "/" : pathname.replace(/^\/en/, "")) as Route;
  const safeFallback = (targetLocale === "en-US" ? "/en" : "/") as Route;

  return <Link
    href={safeFallback}
    hrefLang={targetLocale}
    lang={targetLocale}
    className="inline-flex min-h-11 items-center rounded-md border bg-surface px-3 text-sm font-medium hover:bg-muted"
    onClick={(event) => {
      window.localStorage.setItem("paulzhang.locale", targetLocale);
      const canonicalAlternate = document.querySelector<HTMLAnchorElement>("[data-language-alternate]");
      if (canonicalAlternate) {
        event.preventDefault();
        window.location.assign(canonicalAlternate.href);
        return;
      }
      const unavailable = document.querySelector<HTMLElement>("[data-translation-unavailable]");
      if (unavailable) {
        event.preventDefault();
        unavailable.tabIndex = -1;
        unavailable.focus();
        return;
      }
      event.preventDefault();
      window.location.assign(targetPath);
    }}
  >
    {copy.language}
  </Link>;
}
