import { DynamicContentRoute } from "@/components/content/dynamic-content-route";
import { metadataForContent } from "@/lib/content/metadata";
import { getContentRepository } from "@/lib/content/repository";
import { getCollectionSlugs, resolveStorySlug } from "@/lib/routing/resolvers";

type Props = {params: Promise<{slug: string}>};
export const dynamicParams = false;
export async function generateStaticParams() {
  const repository = await getContentRepository();
  return [...getCollectionSlugs("/stories"), ...repository.getPublishedContent("zh-CN").filter((item) => item.domain === "stories").map((item) => item.slug)].map((slug) => ({slug}));
}
export async function generateMetadata({params}: Props) {
  const repository = await getContentRepository();
  const result = resolveStorySlug((await params).slug, "zh-CN", repository);
  return result.kind === "content" ? metadataForContent(result.item, repository) : {};
}
export default async function Page({params}: Props) {
  const repository = await getContentRepository();
  return <DynamicContentRoute resolution={resolveStorySlug((await params).slug, "zh-CN", repository)} locale="zh-CN" routeId="stories" repository={repository} />;
}
