import type {Locale} from "@/config/i18n";
import type {ContentRepository} from "@/lib/content/repository";

export const aboutWritingEssaySlugs=["speak-write-live-the-word"] as const;
export type AboutWritingEssaySlug=(typeof aboutWritingEssaySlugs)[number];
export function isAboutWritingEssaySlug(value:string):value is AboutWritingEssaySlug{return aboutWritingEssaySlugs.includes(value as AboutWritingEssaySlug)}
export function getAboutWritingEssay(repository:ContentRepository,locale:Locale,slug:AboutWritingEssaySlug){return repository.getContentBySlug("about",slug,locale)}
export function aboutWritingEssayPath(locale:Locale,slug:AboutWritingEssaySlug){return `${locale==="en-US"?"/en":""}/about/writing-preaching/${slug}` as const}
