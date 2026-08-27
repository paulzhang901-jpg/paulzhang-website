import { FictionLandingPage } from "@/components/fiction/fiction-landing-page";
import { fictionLandingMetadata } from "@/lib/fiction/metadata";
export const metadata = fictionLandingMetadata("zh-CN");
export default function Page() { return <FictionLandingPage locale="zh-CN" />; }
