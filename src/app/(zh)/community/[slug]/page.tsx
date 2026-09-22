import {notFound} from "next/navigation";
import {CommunitySectionPage} from "@/components/content/community-page";
import {getCommunitySectionIds,isCommunitySection} from "@/lib/community";
import {metadataForCommunitySection} from "@/lib/seo/metadata";
type Props={params:Promise<{slug:string}>}; export const dynamicParams=false;
export function generateStaticParams(){return getCommunitySectionIds().map(slug=>({slug}))}
export async function generateMetadata({params}:Props){const slug=(await params).slug;return isCommunitySection(slug)?metadataForCommunitySection(slug,"zh-CN"):{};}
export default async function Page({params}:Props){const slug=(await params).slug;if(!isCommunitySection(slug))notFound();return <CommunitySectionPage locale="zh-CN" section={slug}/>}
