import { SocialContactPage } from "@/components/product/social-contact-page";
import { metadataForRoute } from "@/lib/seo/metadata";

export const metadata = metadataForRoute("contact", "zh-CN");

export default function Page() {
  return <SocialContactPage locale="zh-CN" />;
}
