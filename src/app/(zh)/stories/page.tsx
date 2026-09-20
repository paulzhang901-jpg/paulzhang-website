import { StoriesPage } from "@/components/content/stories-page";
import { getContentRepository } from "@/lib/content/repository";
import { getContentWorkRepository } from "@/lib/content/works/repository";
import { metadataForRoute } from "@/lib/seo/metadata";
export const metadata = metadataForRoute("stories", "zh-CN");
export default async function Page() { return <StoriesPage locale="zh-CN" contentRepository={await getContentRepository()} workRepository={await getContentWorkRepository()} />; }
