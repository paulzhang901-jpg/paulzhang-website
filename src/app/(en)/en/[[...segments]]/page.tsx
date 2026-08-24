import { notFound } from "next/navigation";
import { FoundationPage } from "@/components/layout/foundation-page";
import { metadataForRoute } from "@/lib/seo/metadata";
import { resolveEnglishSegments, routes } from "@/lib/i18n/routing";

type Props = {params: Promise<{segments?: string[]}>};

export function generateStaticParams() {
  return routes.map((route) => ({segments: route.path === "/" ? [] : route.path.slice(1).split("/")}));
}

export async function generateMetadata({params}: Props) {
  const routeId = resolveEnglishSegments((await params).segments);
  return routeId ? metadataForRoute(routeId, "en-US") : {};
}

export default async function Page({params}: Props) {
  const routeId = resolveEnglishSegments((await params).segments);
  if (!routeId) notFound();
  return <FoundationPage locale="en-US" routeId={routeId} />;
}
