import { DynamicContentRoute } from "@/components/content/dynamic-content-route";
import { metadataForContent } from "@/lib/content/metadata";
import { getContentRepository } from "@/lib/content/repository";
import { getCollectionSlugs, resolveStorySlug } from "@/lib/routing/resolvers";
import { ContentWorkPage } from "@/components/content/content-work-page";
import { getContentWorkRepository } from "@/lib/content/works/repository";
import { getWorkStaticParams, resolveWorkRoute } from "@/lib/content/works/routing";
import { metadataForWork } from "@/lib/content/works/metadata";
import { metadataForCollectionRoute } from "@/lib/seo/metadata";

type Props = {params: Promise<{slug: string}>};
export const dynamicParams = false;
export async function generateStaticParams() {
  const repository = await getContentRepository();
  const workRepository = await getContentWorkRepository();
  const slugs = new Set([
    ...getCollectionSlugs("/stories"),
    ...repository
      .getPublishedContent("en-US")
      .filter((item) => item.domain === "stories")
      .map((item) => item.slug),
    ...getWorkStaticParams("en-US", workRepository).map(({slug}) => slug),
  ]);
  return [...slugs].map((slug) => ({slug}));
}
export async function generateMetadata({params}: Props) {
  const workRepository = await getContentWorkRepository();
  const work = resolveWorkRoute((await params).slug, "en-US", workRepository);
  if (work.kind === "work") return metadataForWork(work.work, work.representation, workRepository);
  const repository = await getContentRepository();
  const result = resolveStorySlug((await params).slug, "en-US", repository);
  if (result.kind === "content") return metadataForContent(result.item, repository);
  return result.kind === "collection" ? metadataForCollectionRoute("stories", result.slug, "en-US") : {};
}
export default async function Page({params}: Props) {
  const workRepository = await getContentWorkRepository();
  const work = resolveWorkRoute((await params).slug, "en-US", workRepository);
  if (work.kind === "work") return <ContentWorkPage {...work} units={workRepository.getOrderedUnits(work.work.canonicalId, "en-US")} repository={workRepository} />;
  const repository = await getContentRepository();
  return <DynamicContentRoute resolution={resolveStorySlug((await params).slug, "en-US", repository)} locale="en-US" routeId="stories" repository={repository} />;
}
