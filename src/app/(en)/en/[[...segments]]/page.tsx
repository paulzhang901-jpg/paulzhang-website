import { notFound } from "next/navigation";
import { FoundationPage } from "@/components/layout/foundation-page";
import { HomePage } from "@/components/product/home-page";
import { LibraryPage } from "@/components/content/library-page";
import { getContentRepository } from "@/lib/content/repository";
import { metadataForRoute } from "@/lib/seo/metadata";
import { resolveEnglishSegments, routes } from "@/lib/i18n/routing";

type Props = {params: Promise<{segments?: string[]}>};

export function generateStaticParams() {
  return routes.filter((route) => route.id !== "start").map((route) => ({segments: route.path === "/" ? [] : route.path.slice(1).split("/")}));
}

export async function generateMetadata({params}: Props) {
  const routeId = resolveEnglishSegments((await params).segments);
  return routeId ? metadataForRoute(routeId, "en-US") : {};
}

export default async function Page({params}: Props) {
  const routeId = resolveEnglishSegments((await params).segments);
  if (!routeId) notFound();
  if (routeId === "home") return <HomePage locale="en-US" />;
  if (routeId === "library") return <LibraryPage locale="en-US" repository={await getContentRepository()} />;
  return <FoundationPage locale="en-US" routeId={routeId} />;
}
