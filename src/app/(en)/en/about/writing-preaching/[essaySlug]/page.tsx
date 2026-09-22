import {notFound} from "next/navigation";
import {AboutWritingEssayPage} from "@/components/content/about-writing-essay-page";
import {aboutWritingEssayPath,aboutWritingEssaySlugs,getAboutWritingEssay,isAboutWritingEssaySlug} from "@/lib/about-writing-essays";
import {getContentRepository} from "@/lib/content/repository";
import {metadataForAboutWritingEssay} from "@/lib/seo/metadata";
type Props={params:Promise<{essaySlug:string}>}; export const dynamicParams=false;
export function generateStaticParams(){return aboutWritingEssaySlugs.map(essaySlug=>({essaySlug}))}
export async function generateMetadata({params}:Props){const essaySlug=(await params).essaySlug;if(!isAboutWritingEssaySlug(essaySlug))return {};const repo=await getContentRepository();const item=getAboutWritingEssay(repo,"en-US",essaySlug);return item?metadataForAboutWritingEssay(item,aboutWritingEssayPath("en-US",essaySlug),aboutWritingEssayPath("zh-CN",essaySlug)):{};}
export default async function Page({params}:Props){const essaySlug=(await params).essaySlug;if(!isAboutWritingEssaySlug(essaySlug))notFound();const repo=await getContentRepository();const item=getAboutWritingEssay(repo,"en-US",essaySlug);if(!item)notFound();return <AboutWritingEssayPage item={item}/>}
