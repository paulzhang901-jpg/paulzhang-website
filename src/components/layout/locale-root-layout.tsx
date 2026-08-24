import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { getMessages, type Locale } from "@/config/i18n";
import "@/styles/globals.css";

export function LocaleRootLayout({locale, children}: {locale: Locale; children: ReactNode}) {
  const copy = getMessages(locale);
  return <html lang={locale}>
    <body className="min-h-screen antialiased">
      <a className="skip-link" href="#main-content">{copy.skip}</a>
      <SiteHeader locale={locale} />
      <main id="main-content" tabIndex={-1} className="min-h-[65vh]">{children}</main>
      <SiteFooter locale={locale} />
    </body>
  </html>;
}
