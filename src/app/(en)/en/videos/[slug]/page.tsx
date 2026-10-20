import { notFound } from "next/navigation";
import { VideoDetailPage, resolveVideoDetail, videoMetadata, videoStaticParams } from "@/components/content/video-detail-page";
import { getContentRepository } from "@/lib/content/repository";
type Props = {params: Promise<{slug: string}>};
export const dynamicParams = false;
export async function generateStaticParams() { return videoStaticParams("en-US", await getContentRepository()); }
export async function generateMetadata({params}: Props) { return videoMetadata((await params).slug, "en-US", await getContentRepository()); }
export default async function Page({params}: Props) {
  const repository = await getContentRepository(); const {slug} = await params;
  if (!resolveVideoDetail(slug, "en-US", repository)) notFound();
  return <VideoDetailPage slug={slug} locale="en-US" repository={repository} />;
}
