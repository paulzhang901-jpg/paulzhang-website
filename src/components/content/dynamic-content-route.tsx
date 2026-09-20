import { notFound } from "next/navigation";
import { ContentPage } from "./content-page";
import { loadPublishedSermon } from "@/lib/sermons/published";
import { LibraryCollectionPage } from "./library-page";
import { FoundationPage } from "@/components/layout/foundation-page";
import { StoryCollectionPage } from "./story-collection-page";
import { GrowthStagePage } from "./growth-page";
import type { ContentRepository } from "@/lib/content/repository";
import type { ContentWorkRepository } from "@/lib/content/works/repository";
import type { DynamicRouteResolution } from "@/lib/routing/resolvers";
import type { ContentLanguage } from "@/types/content";

export async function DynamicContentRoute({resolution, locale, routeId, repository, workRepository}: {
  resolution: DynamicRouteResolution;
  locale: ContentLanguage;
  routeId: "library" | "stories" | "grow";
  repository: ContentRepository;
  workRepository?: ContentWorkRepository;
}) {
  if (resolution.kind === "not-found") notFound();
  if (resolution.kind === "content") {
    if (resolution.item.contentType === "sermon") {
      const sermon = loadPublishedSermon(resolution.item.id, locale);
      if (!sermon) notFound();
      return <ContentPage item={{...resolution.item, body: sermon.body}} repository={repository} />;
    }
    return <ContentPage item={resolution.item} repository={repository} />;
  }
  if (routeId === "library") return <LibraryCollectionPage locale={locale} collection={resolution.slug} repository={repository} />;
  if (routeId === "stories" && workRepository) return <StoryCollectionPage locale={locale} collection={resolution.slug} repository={repository} workRepository={workRepository} />;
  if (routeId === "grow") return <GrowthStagePage locale={locale} stage={resolution.slug} repository={repository} />;
  return <FoundationPage locale={locale} routeId={routeId} />;
}
