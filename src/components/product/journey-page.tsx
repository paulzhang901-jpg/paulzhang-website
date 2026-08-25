import Link from "next/link";
import type { Route } from "next";
import type { Locale } from "@/config/i18n";
import { getProductCopy, type JourneyId } from "@/config/product";
import { localizedPath } from "@/lib/i18n/routing";
import { getJourney } from "@/lib/product/journeys";
import { resolvePublicCurated } from "@/lib/product/content";
import { Container } from "@/components/layout/container";
import { ContentTeaser } from "./content-teaser";

export async function JourneyPage({locale, journeyId}: {locale: Locale; journeyId: JourneyId}) {
  const c = getProductCopy(locale); const journey = getJourney(journeyId);
  const resolved = await Promise.all(journey.featured_content.map((id) => resolvePublicCurated(id, locale)));
  const content = resolved.filter((item) => item !== null);
  const prefix = locale === "en-US" ? "/en" : "";
  const primaryHref = journey.primary_experience === "stories" ? `${prefix}/stories` : journey.primary_experience === "grow" ? `${prefix}/grow` : journey.primary_experience === "companionship" ? `${prefix}/together` : `${prefix}/library`;
  const startingPoints = [
    {label: c.journeyPage.explore, href: primaryHref},
    {label: c.featured.truth, href: `${prefix}/library`},
    {label: c.featured.story, href: `${prefix}/stories`},
  ];
  return <article className="py-[var(--space-section)]"><Container><header className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-widest text-primary">Start Here</p><h1 className="mt-3 font-serif text-4xl sm:text-5xl">{c.journeys[journeyId]}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{c.journeyPage.ack}</p></header>
    <section className="mt-12" aria-labelledby="starting-points"><h2 id="starting-points" className="font-serif text-3xl">{c.journeyPage.starting}</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{startingPoints.map((point) => <Link className="rounded-lg border bg-surface p-5 font-medium shadow-[var(--shadow-soft)]" href={point.href as Route} key={point.href}>{point.label} <span aria-hidden="true">→</span></Link>)}</div></section>
    <section className="mt-14" aria-labelledby="related"><h2 id="related" className="font-serif text-3xl">{c.journeyPage.related}</h2><div className="mt-6 grid gap-5 md:grid-cols-2">{content.map((item) => <ContentTeaser key={item.canonicalId} item={item} locale={locale} label={item.domain === "stories" ? c.featured.story : c.featured.truth} event="home.action_opened" />)}{content.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-muted-foreground">{c.featured.unavailable}</p> : null}</div></section>
    <section className="mt-14 max-w-3xl rounded-lg bg-muted p-6" aria-labelledby="reflection"><h2 id="reflection" className="font-serif text-3xl">{c.journeyPage.reflection}</h2><p className="mt-4 leading-7">{c.journeyPage.reflectionBody}</p></section>
    <section className="mt-14 max-w-3xl" aria-labelledby="next-step"><h2 id="next-step" className="font-serif text-3xl">{c.journeyPage.next}</h2><Link className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-primary-foreground" href={primaryHref as Route}>{c.journeyPage.explore}</Link>{journey.relationship_weight !== "weak" ? <p className="mt-6 leading-7 text-muted-foreground">{c.journeyPage.optional} <Link className="underline" href={localizedPath("together", locale)}>{c.companionship.primary}</Link></p> : null}</section>
  </Container></article>;
}
