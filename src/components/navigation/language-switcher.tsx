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

  return <Link
    href={targetPath}
    hrefLang={targetLocale}
    lang={targetLocale}
    className="inline-flex min-h-11 items-center rounded-md border bg-surface px-3 text-sm font-medium hover:bg-muted"
    onClick={() => window.localStorage.setItem("paulzhang.locale", targetLocale)}
  >
    {copy.language}
  </Link>;
}
