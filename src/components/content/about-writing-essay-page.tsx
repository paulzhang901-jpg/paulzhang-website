import Link from "next/link";
import {MDXRemote} from "next-mdx-remote/rsc";
import {Container,ReadingContainer} from "@/components/layout/container";
import {Section} from "@/components/layout/section";
import {AboutNav} from "@/components/content/about-page";
import type {NormalizedContentItem} from "@/types/content";

export function AboutWritingEssayPage({item}:{item:NormalizedContentItem}){
  const zh=item.language==="zh-CN";
  return <Section><Container><div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]"><AboutNav locale={item.language} current="writing-preaching"/><article className="min-w-0"><ReadingContainer className="px-0"><nav aria-label={zh?"面包屑":"Breadcrumbs"} className="mb-8 text-sm text-muted-foreground"><Link className="hover:underline" href={`${zh?"":"/en"}/about/writing-preaching`}>{zh?"写作与讲道":"Writing & Preaching"}</Link></nav><p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{zh?"写作与讲道":"Writing & Preaching"}</p><h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{item.title}</h1>{item.subtitle?<p className="mt-5 text-xl leading-8 text-muted-foreground">{item.subtitle}</p>:null}<div className="prose-content mt-10"><MDXRemote source={item.body}/></div></ReadingContainer></article></div></Container></Section>
}
