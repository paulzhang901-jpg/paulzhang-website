import { AboutIntegratedPage } from "@/components/content/about-page";
import { SupportPage } from "@/components/product/support-page";
import { metadataForRoute } from "@/lib/seo/metadata";

export const metadata = {...metadataForRoute("support", "zh-CN"), title: "支持这份工作"};
export default function Page() { return <AboutIntegratedPage locale="zh-CN" section="support"><SupportPage locale="zh-CN" /></AboutIntegratedPage>; }
