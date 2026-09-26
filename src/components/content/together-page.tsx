import Link from "next/link";
import type {Route} from "next";
import {Container, ReadingContainer} from "@/components/layout/container";
import {Section, SectionHeading} from "@/components/layout/section";
import {contentPath} from "@/lib/content/paths";
import {ebooks, ebookCoverUrl, ebookPdfUrl} from "@/lib/content/ebooks";
import type {ContentRepository} from "@/lib/content/repository";
import {getTogetherSectionIds,getTogetherSectionItems,isTogetherParticipationSection,togetherSectionLabel} from "@/lib/content/together";
import type {ContentLanguage} from "@/types/content";
import {TogetherSubmissionForm} from "./together-submission-form";

const prefix=(locale:ContentLanguage)=>locale === "en-US" ? "/en" : "";
const actionCopy={
  "zh-CN":{mentoring:"申请个人陪伴", "prayer-support":"提交祷告需要", "growth-groups":"表达参加成长小组的兴趣",contact:"报名或联系",testimonies:"分享你的见证"},
  "en-US":{mentoring:"Request mentoring", "prayer-support":"Share a prayer request", "growth-groups":"Express interest in a growth group",contact:"Sign up or contact",testimonies:"Share your story"},
} as const;
function SectionNav({locale}:{locale:ContentLanguage}){return <aside aria-labelledby="together-sections"><h2 id="together-sections" className="font-serif text-2xl">{locale === "zh-CN" ? "与你同行" : "Together"}</h2><p className="mt-3 leading-7 text-muted-foreground">{locale === "zh-CN" ? "选择一种同行、支持或参与方式。" : "Choose a way to connect, receive support, or participate."}</p><nav aria-label={locale === "zh-CN" ? "同行栏目" : "Together sections"} className="mt-6 flex flex-wrap gap-2 lg:flex-col lg:items-start">{getTogetherSectionIds().map(id=><Link key={id} href={`${prefix(locale)}/together/${id}` as Route} className="rounded-full border bg-surface px-4 py-2 text-sm hover:bg-muted lg:w-full lg:rounded-md">{togetherSectionLabel(locale,id)}</Link>)}</nav></aside>}
function ParticipationAction({locale,section}:{locale:ContentLanguage;section:string}){
  if(!isTogetherParticipationSection(section))return null;
  const label=actionCopy[locale][section as keyof typeof actionCopy[typeof locale]];
  return <div className="mb-8 rounded-lg border bg-muted/40 p-6"><h3 className="font-serif text-2xl">{label}</h3><div className="mt-5"><TogetherSubmissionForm locale={locale} section={section as "mentoring"|"prayer-support"|"growth-groups"|"contact"|"testimonies"}/></div></div>;
}
function RecommendedEbooks({locale}:{locale:ContentLanguage}){
  const chinese = locale === "zh-CN";
  return <div className="mt-6">
    <p className="mb-6 leading-7 text-muted-foreground">{chinese ? "《删不掉的光》系列 · 中英文双语 · 免费 PDF 电子书" : "The Light They Could Not Erase · Bilingual Chinese–English · Free PDF E-books"}</p>
    <div className="grid gap-6 md:grid-cols-2">
      {ebooks.map(book => <article key={book.volume} className="flex flex-col overflow-hidden rounded-lg border bg-surface">
        <div className="flex justify-center bg-muted/50 p-6">
          {/* Static public cover, shared with the Library. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ebookCoverUrl(book.volume)} alt={chinese ? `${book.zhTitle}封面` : `Cover of ${book.enTitle}`} width={300} height={400} className="h-56 w-auto max-w-full object-contain shadow-sm" />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="text-sm font-semibold text-primary">{chinese ? `第 ${book.volume} 册` : `Volume ${book.volume}`}</p>
          <h3 className="mt-3 font-serif text-2xl leading-snug">{chinese ? book.zhTitle : book.enTitle}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{chinese ? book.enTitle : book.zhTitle}</p>
          <p className="mt-4 flex-1 leading-7 text-muted-foreground">{chinese ? book.zhDescription : book.enDescription}</p>
          <a href={ebookPdfUrl(book.volume)} download className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground hover:opacity-90">{chinese ? "免费下载 PDF" : "Download PDF"}</a>
        </div>
      </article>)}
    </div>
  </div>;
}
function Results({locale,section,repository}:{locale:ContentLanguage;section:string;repository:ContentRepository}){const items=getTogetherSectionItems(repository,locale,section);return <div><h2 className="font-serif text-3xl">{togetherSectionLabel(locale,section)}</h2><ParticipationAction locale={locale} section={section}/>{section === "resources" ? <RecommendedEbooks locale={locale}/> : null}<div className="space-y-6">{items.length?items.map(item=><article key={item.id} className="border-y py-6"><h3 className="font-serif text-2xl"><Link className="hover:underline" href={contentPath(item)}>{item.title}</Link></h3><p className="mt-3 leading-7 text-muted-foreground">{item.summary}</p></article>):section === "resources" ? null : <p className="rounded-lg border border-dashed p-8 text-muted-foreground">{locale === "zh-CN" ? "这个栏目目前还没有已公开的内容。" : "No published content is available in this section yet."}</p>}</div></div>}
export function TogetherPage({locale,repository}:{locale:ContentLanguage;repository:ContentRepository}){return <><Section className="border-b bg-muted/40"><Container><ReadingContainer className="px-0"><SectionHeading eyebrow={locale === "zh-CN" ? "关系与同行" : "Relationship & Companionship"} title={locale === "zh-CN" ? "与你同行" : "Together"}><p>{locale === "zh-CN" ? "有些问题需要答案，有些道路需要有人同行。这里提供清楚、安全、以人为中心的下一步。" : "Some questions need answers; some roads need companionship. Find a clear, safe, human-centered next step here."}</p></SectionHeading></ReadingContainer></Container></Section><Section><Container><div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]"><SectionNav locale={locale}/><Results locale={locale} section="mentoring" repository={repository}/></div></Container></Section></>}
export function TogetherSectionPage({locale,section,repository}:{locale:ContentLanguage;section:string;repository:ContentRepository}){return <Section><Container><div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)]"><SectionNav locale={locale}/><Results locale={locale} section={section} repository={repository}/></div></Container></Section>}
