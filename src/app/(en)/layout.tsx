import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LocaleRootLayout } from "@/components/layout/locale-root-layout";
import { getMessages } from "@/config/i18n";
import { siteUrl } from "@/lib/seo/metadata";

const copy = getMessages("en-US");
export const metadata: Metadata = {metadataBase: siteUrl, title: {default: copy.siteName, template: `%s · ${copy.siteName}`}, description: copy.siteDescription};
export default function Layout({children}: {children: ReactNode}) { return <LocaleRootLayout locale="en-US">{children}</LocaleRootLayout>; }
