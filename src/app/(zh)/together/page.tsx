import {TogetherPage} from "@/components/content/together-page";
import {getContentRepository} from "@/lib/content/repository";
import {metadataForRoute} from "@/lib/seo/metadata";
export const metadata=metadataForRoute("together","zh-CN");
export default async function Page(){return <TogetherPage locale="zh-CN" repository={await getContentRepository()}/>;}
