import { StartPage } from "@/components/product/start-page";
import { metadataForRoute } from "@/lib/seo/metadata";
export const metadata = metadataForRoute("start", "zh-CN");
export default function Page() { return <StartPage locale="zh-CN" />; }
