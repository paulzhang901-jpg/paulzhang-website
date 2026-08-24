import { FoundationPage } from "@/components/layout/foundation-page";
import { metadataForRoute } from "@/lib/seo/metadata";
export const metadata = metadataForRoute("search", "zh-CN");
export default function Page() { return <FoundationPage locale="zh-CN" routeId="search" />; }
