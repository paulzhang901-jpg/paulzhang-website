import type { Locale } from "@/config/i18n";
import type { NormalizedContentItem } from "@/types/content";
import { contentHref } from "@/lib/product/content";
import { TrackedLink } from "./tracked-link";

export function ContentTeaser({item, locale, label, event}: {item: NormalizedContentItem | null; locale: Locale; label: string; event: "home.action_opened" | "encouragement.clicked"}) {
  if (!item) return null;
  const destination = item.domain === "growth" ? "formation" : item.domain === "pages" ? "about" : item.domain;
  return <article className="rounded-lg border bg-surface p-6 shadow-[var(--shadow-soft)]">
    <p className="text-sm font-semibold text-primary">{label}</p>
    <h3 className="mt-2 font-serif text-2xl"><TrackedLink href={contentHref(item, locale)} event={event} payload={{locale, source: "curated", destination_type: destination}} className="hover:underline">{item.title}</TrackedLink></h3>
    <p className="mt-3 leading-7 text-muted-foreground">{item.summary}</p>
  </article>;
}
