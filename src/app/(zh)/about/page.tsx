import { FoundationPage } from "@/components/layout/foundation-page";
import { metadataForRoute } from "@/lib/seo/metadata";
export const metadata = metadataForRoute("about", "zh-CN");
export default function Page() { return <FoundationPage locale="zh-CN" routeId="about" />; }
