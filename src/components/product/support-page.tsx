import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Section, SectionHeading } from "@/components/layout/section";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import type { Locale } from "@/config/i18n";
import { churchGivingWebsite, supportCopy, supportMethods } from "@/data/support-methods";

export function SupportPage({locale}: {locale: Locale}) {
  const c = supportCopy[locale];
  return <Section><Container>
    <Breadcrumbs locale={locale} routeId="support" />
    <div className="mx-auto max-w-4xl">
      <SectionHeading eyebrow={c.personal} title={c.title} />
      <div className="max-w-3xl space-y-4 text-lg leading-8 text-muted-foreground">{c.hero.map((p) => <p key={p}>{p}</p>)}</div>
      <section aria-label={c.oneTime + " / " + c.ongoing} className="mt-12 rounded-lg border bg-muted/60 p-6 sm:p-8">
        <div className="grid gap-7 sm:grid-cols-2"><div><h2 className="font-serif text-2xl">{c.oneTime}</h2><p className="mt-3 leading-7">{c.oneTimeBody}</p></div><div><h2 className="font-serif text-2xl">{c.ongoing}</h2><p className="mt-3 leading-7">{c.ongoingBody}</p></div></div>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">{c.recurringNote}</p>
      </section>
      {(["china", "international"] as const).map((region) => <section key={region} aria-labelledby={`support-${region}`} className="mt-14">
        <h2 id={`support-${region}`} className="font-serif text-3xl">{c.regions[region].title}</h2>
        <p className="mt-3 leading-7 text-muted-foreground">{c.regions[region].intro}</p>
        <div className="mt-6 grid items-start gap-6 md:grid-cols-2">{supportMethods.filter((method) => method.region === region).map((method) => <article key={method.id} data-support-method={method.id} className="min-w-0 rounded-lg border bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <h3 className="font-serif text-2xl">{method.displayName[locale]}</h3>
          <p className="mt-3 leading-7">{method.scan[locale]}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{c.methodDescription}</p>
          {method.recipientName ? <p className="mt-3 text-sm">{c.recipient}: {method.recipientName}</p> : null}
          <Image src={method.assetPath} alt={method.alt} width={method.width} height={method.height} unoptimized className="mt-5 h-auto w-full" />
          <a href={method.assetPath} className="mt-4 inline-flex min-h-11 items-center text-sm underline underline-offset-4">{c.original}</a>
        </article>)}</div>
      </section>)}
      <p className="mt-6 text-sm leading-7 text-muted-foreground">{c.scanHelp}</p>
      <section className="mt-14 border-t pt-10"><h2 className="font-serif text-3xl">{c.nonFinancialTitle}</h2><div className="mt-5 space-y-4 leading-8">{c.nonFinancial.map((p) => <p key={p}>{p}</p>)}</div></section>
      <section className="mt-12 rounded-lg border bg-muted/60 p-6 sm:p-8"><h2 className="font-serif text-2xl">{c.noticeTitle}</h2><div className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">{c.notice.map((p) => <p key={p}>{p}</p>)}</div></section>
      <section className="mt-10 border-t pt-8 text-sm"><h2 className="font-serif text-xl">{c.churchTitle}</h2><p className="mt-3 leading-7 text-muted-foreground">{c.churchBody}</p><a href={churchGivingWebsite} className="mt-3 inline-flex min-h-11 items-center underline underline-offset-4">{c.churchLink} →</a></section>
    </div>
  </Container></Section>;
}
