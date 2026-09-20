import {GrowthPage} from "@/components/content/growth-page";
import {getContentRepository} from "@/lib/content/repository";
import {metadataForRoute} from "@/lib/seo/metadata";
export const metadata=metadataForRoute("grow","zh-CN");
export default async function Page(){return <GrowthPage locale="zh-CN" repository={await getContentRepository()}/>;}
