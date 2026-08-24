import { DynamicContentRoute } from "@/components/content/dynamic-content-route";
import { getContentRepository } from "@/lib/content/repository";
import { getGrowthStages, resolveGrowthStage } from "@/lib/routing/resolvers";

type Props = {params: Promise<{stage: string}>};
export const dynamicParams = false;
export function generateStaticParams() { return getGrowthStages().map((stage) => ({stage})); }
export default async function Page({params}: Props) {
  const repository = await getContentRepository();
  return <DynamicContentRoute resolution={resolveGrowthStage((await params).stage)} locale="en-US" routeId="grow" repository={repository} />;
}
