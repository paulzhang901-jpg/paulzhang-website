import { AppPrivacyPolicyPage } from "@/components/product/app-privacy-policy-page";
import { metadataForRoute } from "@/lib/seo/metadata";
export const metadata = {...metadataForRoute("legal-privacy", "zh-CN"), title: "隐私政策"};
export default function Page() { return <AppPrivacyPolicyPage locale="zh-CN" />; }
