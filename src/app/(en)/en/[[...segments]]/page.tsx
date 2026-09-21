import { notFound } from "next/navigation";
import { FoundationPage } from "@/components/layout/foundation-page";
import { HomePage } from "@/components/product/home-page";
import { SupportPage } from "@/components/product/support-page";
import { LibraryPage } from "@/components/content/library-page";
import { StoriesPage } from "@/components/content/stories-page";
import { GrowthPage } from "@/components/content/growth-page";
import { TogetherPage } from "@/components/content/together-page";
import { CommunityPage } from "@/components/content/community-page";
import { LightJourneyPage } from "@/components/content/light-journey-page";
import { AboutPage, AboutIntegratedPage } from "@/components/content/about-page";
import { getContentWorkRepository } from "@/lib/content/works/repository";
import { SocialContactPage } from "@/components/product/social-contact-page";
import { getContentRepository } from "@/lib/content/repository";
import { metadataForRoute } from "@/lib/seo/metadata";
import { resolveEnglishSegments, routes } from "@/lib/i18n/routing";

type Props = {params: Promise<{segments?: string[]}>};

export function generateStaticParams() {
  return routes.filter((route) => route.id !== "start").map((route) => ({segments: route.path === "/" ? [] : route.path.slice(1).split("/")}));
}

export async function generateMetadata({params}: Props) {
  const routeId = resolveEnglishSegments((await params).segments);
  return routeId ? {...metadataForRoute(routeId, "en-US"), ...(routeId === "support" ? {title: "Support This Work"} : {})} : {};
}

export default async function Page({params}: Props) {
  const routeId = resolveEnglishSegments((await params).segments);
  if (!routeId) notFound();
  if (routeId === "home") return <HomePage locale="en-US" />;
  if (routeId === "support") return <AboutIntegratedPage locale="en-US" section="support"><SupportPage locale="en-US" /></AboutIntegratedPage>;
  if (routeId === "library") return <LibraryPage locale="en-US" repository={await getContentRepository()} />;
  if (routeId === "stories") return <StoriesPage locale="en-US" contentRepository={await getContentRepository()} workRepository={await getContentWorkRepository()} />;
  if (routeId === "grow") return <GrowthPage locale="en-US" repository={await getContentRepository()} />;
  if (routeId === "together") return <TogetherPage locale="en-US" repository={await getContentRepository()} />;
  if (routeId === "community") return <CommunityPage locale="en-US" />;
  if (routeId === "journey") return <LightJourneyPage locale="en-US" />;
  if (routeId === "about") return <AboutPage locale="en-US" />;
  if (routeId === "contact") return <AboutIntegratedPage locale="en-US" section="contact"><SocialContactPage locale="en-US" /></AboutIntegratedPage>;
  return <FoundationPage locale="en-US" routeId={routeId} />;
}
