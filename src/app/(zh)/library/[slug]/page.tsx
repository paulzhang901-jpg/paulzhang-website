import { DynamicContentRoute } from "@/components/content/dynamic-content-route";
import { metadataForContent } from "@/lib/content/metadata";
import { getContentRepository } from "@/lib/content/repository";
import { getCollectionSlugs, resolveLibrarySlug } from "@/lib/routing/resolvers";
import { metadataForCollectionRoute } from "@/lib/seo/metadata";

type Props = {params: Promise<{slug: string}>};
export const dynamicParams = false;
export async function generateStaticParams() {
  const repository = await getContentRepository();
  return [...getCollectionSlugs("/library"), ...repository.getPublishedContent("zh-CN").filter((item) => item.domain === "library").map((item) => item.slug)].map((slug) => ({slug}));
}
export async function generateMetadata({params}: Props) {
  const repository = await getContentRepository();
  const result = resolveLibrarySlug((await params).slug, "zh-CN", repository);
  if (result.kind === "content") return metadataForContent(result.item, repository);
  return result.kind === "collection" ? metadataForCollectionRoute("library", result.slug, "zh-CN") : {};
}
export default async function Page({params}: Props) {
  const repository = await getContentRepository();
  return <DynamicContentRoute resolution={resolveLibrarySlug((await params).slug, "zh-CN", repository)} locale="zh-CN" routeId="library" repository={repository} />;
}
