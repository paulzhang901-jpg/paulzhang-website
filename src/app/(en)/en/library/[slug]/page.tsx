import { DynamicContentRoute } from "@/components/content/dynamic-content-route";
import { metadataForContent } from "@/lib/content/metadata";
import { getContentRepository } from "@/lib/content/repository";
import { getCollectionSlugs, resolveLibrarySlug } from "@/lib/routing/resolvers";
import { metadataForCollectionRoute } from "@/lib/seo/metadata";

type Props = {params: Promise<{slug: string}>};
export const dynamicParams = false;
export async function generateStaticParams() {
  const repository = await getContentRepository();
  return [...getCollectionSlugs("/library"), ...repository.getPublishedContent("en-US").filter((item) => item.domain === "library").map((item) => item.slug)].map((slug) => ({slug}));
}
export async function generateMetadata({params}: Props) {
  const repository = await getContentRepository();
  const result = resolveLibrarySlug((await params).slug, "en-US", repository);
  if (result.kind === "content") return metadataForContent(result.item, repository);
  return result.kind === "collection" ? metadataForCollectionRoute("library", result.slug, "en-US") : {};
}
export default async function Page({params}: Props) {
  const repository = await getContentRepository();
  return <DynamicContentRoute resolution={resolveLibrarySlug((await params).slug, "en-US", repository)} locale="en-US" routeId="library" repository={repository} />;
}
