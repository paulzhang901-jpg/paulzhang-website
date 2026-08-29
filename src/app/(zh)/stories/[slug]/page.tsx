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
      .getPublishedContent("zh-CN")
      .filter((item) => item.domain === "stories")
      .map((item) => item.slug),
    ...getWorkStaticParams("zh-CN", workRepository).map(({slug}) => slug),
  ]);
  return [...slugs].map((slug) => ({slug}));
}
export async function generateMetadata({params}: Props) {
  const workRepository = await getContentWorkRepository();
  const work = resolveWorkRoute((await params).slug, "zh-CN", workRepository);
  if (work.kind === "work") return metadataForWork(work.work, work.representation, workRepository);
  const repository = await getContentRepository();
  const result = resolveStorySlug((await params).slug, "zh-CN", repository);
  if (result.kind === "content") return metadataForContent(result.item, repository);
  return result.kind === "collection" ? metadataForCollectionRoute("stories", result.slug, "zh-CN") : {};
}
export default async function Page({params}: Props) {
  const workRepository = await getContentWorkRepository();
  const work = resolveWorkRoute((await params).slug, "zh-CN", workRepository);
  if (work.kind === "work") return <ContentWorkPage {...work} units={workRepository.getOrderedUnits(work.work.canonicalId, "zh-CN")} repository={workRepository} />;
  const repository = await getContentRepository();
  return <DynamicContentRoute resolution={resolveStorySlug((await params).slug, "zh-CN", repository)} locale="zh-CN" routeId="stories" repository={repository} />;
}
