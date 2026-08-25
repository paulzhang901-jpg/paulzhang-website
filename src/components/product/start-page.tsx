import Link from "next/link";
import type { Route } from "next";
import type { Locale } from "@/config/i18n";
import { getProductCopy, journeyIds, journeyPath } from "@/config/product";
import { localizedPath } from "@/lib/i18n/routing";
import { Container } from "@/components/layout/container";
import { TrackedLink } from "./tracked-link";

export function StartPage({locale}: {locale: Locale}) {
  const c = getProductCopy(locale);
  return <section className="py-[var(--space-section)]"><Container><header className="max-w-3xl"><h1 className="font-serif text-4xl sm:text-5xl">{c.start.title}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{c.start.helper}</p></header><div className="mt-10 grid gap-4 md:grid-cols-2">{journeyIds.map((id) => <TrackedLink key={id} href={journeyPath(id, locale) as Route} event="intent.selected" payload={{locale, journey_id: id, source: "start"}} className="rounded-lg border bg-surface p-6 text-lg font-medium shadow-[var(--shadow-soft)] hover:bg-muted">{c.journeys[id]} <span aria-hidden="true">→</span></TrackedLink>)}</div><Link href={localizedPath("library", locale)} className="mt-8 inline-block underline">{c.start.fallback}</Link></Container></section>;
}
