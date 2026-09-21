import {notFound} from "next/navigation";
import {LightJourneySectionPage} from "@/components/content/light-journey-page";
import {getLightJourneySectionIds,isLightJourneySection} from "@/lib/light-journey";
import {metadataForCollectionRoute} from "@/lib/seo/metadata";
type Props={params:Promise<{slug:string}>}; export const dynamicParams=false;
export function generateStaticParams(){return getLightJourneySectionIds().map(slug=>({slug}))}
export async function generateMetadata({params}:Props){const slug=(await params).slug;return isLightJourneySection(slug)?metadataForCollectionRoute("journey",slug,"zh-CN"):{};}
export default async function Page({params}:Props){const slug=(await params).slug;if(!isLightJourneySection(slug))notFound();return <LightJourneySectionPage locale="zh-CN" section={slug}/>}
