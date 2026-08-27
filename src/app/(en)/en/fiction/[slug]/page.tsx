import { notFound } from "next/navigation";
import { FictionWorkPage } from "@/components/fiction/fiction-work-page";
import { fictionWorkMetadata } from "@/lib/fiction/metadata";
import { getFictionWork, getFictionWorks } from "@/lib/fiction/repository";

type Props = {params: Promise<{slug: string}>};
export const dynamicParams = false;
export function generateStaticParams() { return getFictionWorks().map(({slug}) => ({slug})); }
export async function generateMetadata({params}: Props) { const work = getFictionWork((await params).slug); return work ? fictionWorkMetadata(work, "en-US") : {}; }
export default async function Page({params}: Props) { const work = getFictionWork((await params).slug); if (!work) notFound(); return <FictionWorkPage work={work} locale="en-US" />; }
