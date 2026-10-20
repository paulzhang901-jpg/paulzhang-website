import { notFound } from "next/navigation";
import { VideoDetailPage, resolveVideoDetail, videoMetadata, videoStaticParams } from "@/components/content/video-detail-page";
import { getContentRepository } from "@/lib/content/repository";
type Props = {params: Promise<{slug: string}>};
export const dynamicParams = false;
export async function generateStaticParams() { return videoStaticParams("zh-CN", await getContentRepository()); }
export async function generateMetadata({params}: Props) { return videoMetadata((await params).slug, "zh-CN", await getContentRepository()); }
export default async function Page({params}: Props) {
  const repository = await getContentRepository(); const {slug} = await params;
  if (!resolveVideoDetail(slug, "zh-CN", repository)) notFound();
  return <VideoDetailPage slug={slug} locale="zh-CN" repository={repository} />;
}
