import { SupportPage } from "@/components/product/support-page";
import { metadataForRoute } from "@/lib/seo/metadata";

export const metadata = {...metadataForRoute("support", "zh-CN"), title: "支持这份工作"};
export default function Page() { return <SupportPage locale="zh-CN" />; }
