import { FictionLandingPage } from "@/components/fiction/fiction-landing-page";
import { fictionLandingMetadata } from "@/lib/fiction/metadata";
export const metadata = fictionLandingMetadata("en-US");
export default function Page() { return <FictionLandingPage locale="en-US" />; }
