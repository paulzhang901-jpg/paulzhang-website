import { notFound } from "next/navigation";
import { ContentPage } from "./content-page";
import { FoundationPage } from "@/components/layout/foundation-page";
import type { ContentRepository } from "@/lib/content/repository";
import type { DynamicRouteResolution } from "@/lib/routing/resolvers";
import type { ContentLanguage } from "@/types/content";

export async function DynamicContentRoute({resolution, locale, routeId, repository}: {
  resolution: DynamicRouteResolution;
  locale: ContentLanguage;
  routeId: "library" | "stories" | "grow";
  repository: ContentRepository;
}) {
  if (resolution.kind === "not-found") notFound();
  if (resolution.kind === "content") return <ContentPage item={resolution.item} repository={repository} />;
  return <FoundationPage locale={locale} routeId={routeId} />;
}
