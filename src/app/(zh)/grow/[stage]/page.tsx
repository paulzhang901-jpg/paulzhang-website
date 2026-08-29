import { DynamicContentRoute } from "@/components/content/dynamic-content-route";
import { getContentRepository } from "@/lib/content/repository";
import { getGrowthStages, resolveGrowthStage } from "@/lib/routing/resolvers";
import { metadataForCollectionRoute } from "@/lib/seo/metadata";

type Props = {params: Promise<{stage: string}>};
export const dynamicParams = false;
export function generateStaticParams() { return getGrowthStages().map((stage) => ({stage})); }
export async function generateMetadata({params}: Props) {
  const resolution = resolveGrowthStage((await params).stage);
  return resolution.kind === "collection" ? metadataForCollectionRoute("grow", resolution.slug, "zh-CN") : {};
}
export default async function Page({params}: Props) {
  const repository = await getContentRepository();
  return <DynamicContentRoute resolution={resolveGrowthStage((await params).stage)} locale="zh-CN" routeId="grow" repository={repository} />;
}
