import { LibraryPage } from "@/components/content/library-page";
import { getContentRepository } from "@/lib/content/repository";
import { metadataForRoute } from "@/lib/seo/metadata";
export const metadata = metadataForRoute("library", "zh-CN");
export default async function Page() { return <LibraryPage locale="zh-CN" repository={await getContentRepository()} />; }
