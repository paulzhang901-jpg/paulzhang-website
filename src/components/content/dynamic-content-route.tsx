import { notFound } from "next/navigation";
import { ContentPage } from "./content-page";
import { SermonPublicationPage } from "./sermon-publication-page";
import { loadPublishedSermon } from "@/lib/sermons/published";
import { LibraryCollectionPage } from "./library-page";
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
  if (resolution.kind === "content") {
    if (resolution.item.contentType === "sermon") {
      const sermon = loadPublishedSermon(resolution.item.id, locale);
      if (!sermon) notFound();
      if (locale === "en-US") return <ContentPage item={{...resolution.item, body: sermon.body}} repository={repository} />;
      return <SermonPublicationPage sermon={sermon} />;
    }
    return <ContentPage item={resolution.item} repository={repository} />;
  }
  if (routeId === "library") return <LibraryCollectionPage locale={locale} collection={resolution.slug} repository={repository} />;
  return <FoundationPage locale={locale} routeId={routeId} />;
}
