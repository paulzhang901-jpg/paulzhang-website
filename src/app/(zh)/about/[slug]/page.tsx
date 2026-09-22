import {notFound} from "next/navigation";
import {AboutSectionPage} from "@/components/content/about-page";
import {getAboutSectionIds,isAboutSection} from "@/lib/about";
import {metadataForAboutSection} from "@/lib/seo/metadata";
type Props={params:Promise<{slug:string}>}; export const dynamicParams=false;
export function generateStaticParams(){return getAboutSectionIds().filter(slug=>slug!=="contact"&&slug!=="support").map(slug=>({slug}))}
export async function generateMetadata({params}:Props){const slug=(await params).slug;return isAboutSection(slug)?metadataForAboutSection(slug,"zh-CN"):{};}
export default async function Page({params}:Props){const slug=(await params).slug;if(!isAboutSection(slug)||slug==="contact"||slug==="support")notFound();return <AboutSectionPage locale="zh-CN" section={slug}/>}
