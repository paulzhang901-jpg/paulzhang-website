import { notFound } from "next/navigation";
import { JourneyPage } from "@/components/product/journey-page";
import { isJourneyId } from "@/lib/product/journeys";
import { journeyIds } from "@/config/product";
import { metadataForJourney } from "@/lib/seo/metadata";
export function generateStaticParams() { return journeyIds.map((journey) => ({journey})); }
export async function generateMetadata({params}: {params: Promise<{journey: string}>}) { const {journey} = await params; return isJourneyId(journey) ? metadataForJourney(journey, "zh-CN") : {}; }
export default async function Page({params}: {params: Promise<{journey: string}>}) { const {journey} = await params; if (!isJourneyId(journey)) notFound(); return <JourneyPage locale="zh-CN" journeyId={journey} />; }
