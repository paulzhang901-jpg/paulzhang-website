import {notFound} from "next/navigation";
import {ContentPage} from "@/components/content/content-page";
import {TogetherSectionPage} from "@/components/content/together-page";
import {getContentRepository} from "@/lib/content/repository";
import {getTogetherRouteSlugs,resolveTogetherSection} from "@/lib/content/together";
import {metadataForCollectionRoute} from "@/lib/seo/metadata";
type Props={params:Promise<{slug:string}>}; export const dynamicParams=false;
export async function generateStaticParams(){const repo=await getContentRepository();return [...getTogetherRouteSlugs(),...repo.getPublishedContent("en-US").filter(x=>x.domain==="together").map(x=>x.slug)].map(slug=>({slug}));}
export async function generateMetadata({params}:Props){const slug=(await params).slug;const section=resolveTogetherSection(slug);return section?metadataForCollectionRoute("together",slug,"en-US"):{};}
export default async function Page({params}:Props){const slug=(await params).slug;const repo=await getContentRepository();const section=resolveTogetherSection(slug);if(section)return <TogetherSectionPage locale="en-US" section={section} repository={repo}/>;const item=repo.getContentBySlug("together",slug,"en-US");if(!item)notFound();return <ContentPage item={item} repository={repo}/>;}
