import { HomePage } from "@/components/product/home-page";
import { metadataForRoute } from "@/lib/seo/metadata";
export const metadata = metadataForRoute("home", "zh-CN");
export default function Page() { return <HomePage locale="zh-CN" />; }
