import {AboutPage} from "@/components/content/about-page";
import {metadataForRoute} from "@/lib/seo/metadata";
export const metadata=metadataForRoute("about","zh-CN");
export default function Page(){return <AboutPage locale="zh-CN"/>}
