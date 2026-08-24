import Link from "next/link";
import { Container } from "./container";
import { getMessages, type Locale } from "@/config/i18n";
import { localizedPath } from "@/lib/i18n/routing";

export function SiteFooter({locale}: {locale: Locale}) {
  const copy = getMessages(locale);
  return <footer className="border-t bg-muted/60 py-10">
    <Container className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
      <p className="max-w-xl text-sm leading-6 text-muted-foreground">{copy.footer}</p>
      <nav aria-label={locale === "zh-CN" ? "页尾导航" : "Footer navigation"} className="flex gap-4 text-sm">
        <Link href={localizedPath("legal-privacy", locale)}>{copy.privacy}</Link>
        <Link href={localizedPath("legal-terms", locale)}>{copy.terms}</Link>
      </nav>
    </Container>
  </footer>;
}
