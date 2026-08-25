import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { Locale } from "@/config/i18n";
import { featuredContent, getProductCopy, journeyIds, journeyPath } from "@/config/product";
import { localizedPath } from "@/lib/i18n/routing";
import { resolvePublicCurated } from "@/lib/product/content";
import { Container } from "@/components/layout/container";
import { ContentTeaser } from "./content-teaser";
import { TrackedLink } from "./tracked-link";
import { HomeViewEvent } from "./home-view-event";

const linkButton = "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 font-medium";
const section = "py-[var(--space-section)]";

export async function HomePage({locale}: {locale: Locale}) {
  const c = getProductCopy(locale);
  const [truth, story] = await Promise.all([resolvePublicCurated(featuredContent.truth, locale), resolvePublicCurated(featuredContent.story, locale)]);
  const event = "home.action_opened" as const;
  return <>
    <HomeViewEvent locale={locale} />
    <section data-home-section="hero" className="pb-[var(--space-section)] pt-6 sm:pt-12"><Container><div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div className="order-2 lg:order-1"><h1 className="font-serif text-4xl leading-[1.15] sm:text-6xl">{c.hero.headline.map((line) => <span className="block" key={line}>{line}</span>)}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{c.hero.subtitle}</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><TrackedLink className={`${linkButton} bg-primary text-primary-foreground`} href={localizedPath("start", locale)} event={event} payload={{locale, source: "hero", destination_type: "start"}}>{c.hero.start}</TrackedLink><TrackedLink className={`${linkButton} border bg-surface`} href={localizedPath("about", locale)} event={event} payload={{locale, source: "hero", destination_type: "about"}}>{c.hero.about}</TrackedLink></div><p className="mt-6 text-sm leading-6 text-muted-foreground">{c.hero.identity}</p></div>
      <div className="order-1 overflow-hidden rounded-[var(--radius-lg)] bg-muted lg:order-2"><Image src="/images/paul/paul-hero-outdoor.jpg" alt={c.hero.alt} width={1440} height={1920} priority sizes="(max-width: 1024px) 100vw, 45vw" className="aspect-[4/5] h-auto w-full object-cover object-[50%_58%]" /></div>
    </div></Container></section>

    <section data-home-section="trust" className={`${section} bg-muted/60`}><Container><h2 className="max-w-3xl font-serif text-3xl sm:text-4xl">{c.trust.title}</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{c.trust.items.map((item, index) => <div className="border-l-4 border-primary pl-5" key={item}><p className="text-sm font-semibold text-primary">0{index + 1}</p><p className="mt-2 text-lg">{item}</p></div>)}</div><p className="mt-8 text-muted-foreground">{c.trust.closing}</p></Container></section>

    <section data-home-section="start" className={section}><Container><h2 className="font-serif text-3xl sm:text-4xl">{c.start.title}</h2><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{c.start.helper}</p><div className="mt-8 grid gap-4 md:grid-cols-2">{journeyIds.map((id) => <TrackedLink key={id} href={journeyPath(id, locale) as Route} event="intent.selected" payload={{locale, journey_id: id, source: "home"}} className="rounded-lg border bg-surface p-5 font-medium shadow-[var(--shadow-soft)] transition-colors hover:bg-muted">{c.journeys[id]} <span aria-hidden="true">→</span></TrackedLink>)}</div><Link className="mt-6 inline-block underline" href={localizedPath("library", locale)}>{c.start.fallback}</Link></Container></section>

    <section data-home-section="entrances" className={`${section} bg-muted/60`}><Container><h2 className="font-serif text-3xl sm:text-4xl">{c.entrances.title}</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{([ ["truth", "library"], ["stories", "stories"], ["companionship", "together"] ] as const).map(([key, route]) => <TrackedLink key={key} href={localizedPath(route, locale)} event={event} payload={{locale, source: "core_entrance", destination_type: key}} className="rounded-lg border bg-surface p-6 shadow-[var(--shadow-soft)]"><p className="text-sm font-semibold text-primary">{c.entrances[key][0]}</p><h3 className="mt-2 font-serif text-2xl">{c.entrances[key][1]}</h3><span className="mt-5 inline-block" aria-hidden="true">→</span></TrackedLink>)}</div></Container></section>

    <section data-home-section="featured" className={section}><Container><h2 className="font-serif text-3xl sm:text-4xl">{c.featured.title}</h2><div className="mt-8 grid gap-5 md:grid-cols-2"><ContentTeaser item={truth} locale={locale} label={c.featured.truth} event={event} />{story ? <ContentTeaser item={story} locale={locale} label={c.featured.story} event={event} /> : <div className="rounded-lg border border-dashed p-6 text-muted-foreground">{c.featured.unavailable}</div>}</div></Container></section>

    <section data-home-section="grow" className={`${section} bg-[color-mix(in_srgb,var(--color-growth)_9%,transparent)]`}><Container><h2 className="font-serif text-3xl sm:text-4xl">{c.grow.title}</h2><p className="mt-5 text-lg tracking-wide">{c.grow.body}</p><TrackedLink className={`${linkButton} mt-7 bg-primary text-primary-foreground`} href={localizedPath("grow", locale)} event={event} payload={{locale, source: "grow", destination_type: "formation"}}>{c.grow.cta}</TrackedLink></Container></section>

    <section data-home-section="companionship" className={section}><Container><div className="grid items-center gap-10 lg:grid-cols-2"><Image src="/images/paul/paul-companionship-study.jpg" alt={c.companionship.alt} width={1280} height={1707} sizes="(max-width: 1024px) 100vw, 50vw" className="aspect-[4/5] w-full rounded-[var(--radius-lg)] object-cover" /><div><h2 className="font-serif text-3xl sm:text-4xl">{c.companionship.title}</h2><p className="mt-5 leading-7 text-muted-foreground">{c.companionship.body}</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><TrackedLink className={`${linkButton} bg-primary text-primary-foreground`} href={localizedPath("together", locale)} event={event} payload={{locale, source: "companionship", destination_type: "companionship"}}>{c.companionship.primary}</TrackedLink><TrackedLink className={`${linkButton} border bg-surface`} href={localizedPath("library", locale)} event={event} payload={{locale, source: "companionship", destination_type: "library"}}>{c.companionship.secondary}</TrackedLink></div></div></div></Container></section>

    <section data-home-section="about" className={`${section} bg-muted/60`}><Container><div className="max-w-3xl"><h2 className="font-serif text-3xl sm:text-4xl">{c.about.title}</h2><p className="mt-5 text-lg leading-8 text-muted-foreground">{c.about.body}</p><TrackedLink className={`${linkButton} mt-7 border bg-surface`} href={localizedPath("about", locale)} event={event} payload={{locale, source: "about", destination_type: "about"}}>{c.about.cta}</TrackedLink></div></Container></section>

    <section id="stay-connected" data-home-section="stay-connected" className={section}><Container><div className="max-w-3xl rounded-lg border bg-surface p-6 sm:p-8"><h2 className="font-serif text-3xl sm:text-4xl">{c.connect.title}</h2><p className="mt-4 leading-7 text-muted-foreground">{c.connect.body}</p><form className="mt-6 flex flex-col gap-3 sm:flex-row" aria-describedby="connect-status"><label className="sr-only" htmlFor="connect-email">{c.connect.placeholder}</label><input id="connect-email" type="email" disabled placeholder={c.connect.placeholder} className="min-h-11 flex-1 rounded-md border bg-muted px-4 disabled:cursor-not-allowed" /><button disabled className="min-h-11 rounded-md bg-primary px-5 text-primary-foreground opacity-60 disabled:cursor-not-allowed">{c.connect.submit}</button></form><p id="connect-status" className="mt-3 text-sm text-muted-foreground">{c.connect.status}</p></div></Container></section>
  </>;
}
