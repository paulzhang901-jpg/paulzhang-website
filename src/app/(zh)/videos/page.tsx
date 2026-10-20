import { VideosPage } from "@/components/content/videos-page";
import { getContentRepository } from "@/lib/content/repository";
import { metadataForRoute } from "@/lib/seo/metadata";
export const metadata = metadataForRoute("videos", "zh-CN");
export default async function Page() {
  return <VideosPage locale="zh-CN" repository={await getContentRepository()} />;
}
