import { StartPage } from "@/components/product/start-page";
import { metadataForRoute } from "@/lib/seo/metadata";
export const metadata = metadataForRoute("start", "en-US");
export default function Page() { return <StartPage locale="en-US" />; }
