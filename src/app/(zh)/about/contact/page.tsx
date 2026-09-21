import { AboutIntegratedPage } from "@/components/content/about-page";
import { SocialContactPage } from "@/components/product/social-contact-page";
import { metadataForRoute } from "@/lib/seo/metadata";

export const metadata = metadataForRoute("contact", "zh-CN");

export default function Page() {
  return <AboutIntegratedPage locale="zh-CN" section="contact"><SocialContactPage locale="zh-CN" /></AboutIntegratedPage>;
}
