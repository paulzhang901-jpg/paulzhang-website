import fs from "node:fs";
import path from "node:path";
import type {ContentRepository} from "./repository";
import type {ContentLanguage} from "@/types/content";

type TogetherRegistry={version:number;sections:Array<{id:string;labels:Record<ContentLanguage,string>;participation:boolean}>;legacy_aliases:Record<string,string>};
type TogetherReferenceRegistry={version:number;references:Array<{section:string;canonical_id:string;target_domain:"library"}>};
let registry:TogetherRegistry|undefined;
let referenceRegistry:TogetherReferenceRegistry|undefined;
export function getTogetherRegistry(){registry ??= JSON.parse(fs.readFileSync(path.join(process.cwd(),"config/architecture/together.yaml"),"utf8")) as TogetherRegistry;return registry;}
export function getTogetherReferenceRegistry(){referenceRegistry ??= JSON.parse(fs.readFileSync(path.join(process.cwd(),"config/architecture/together-references.yaml"),"utf8")) as TogetherReferenceRegistry;return referenceRegistry;}
export function getTogetherSectionIds(){return getTogetherRegistry().sections.map(({id})=>id);}
export function getTogetherRouteSlugs(){return [...getTogetherSectionIds(),...Object.keys(getTogetherRegistry().legacy_aliases)];}
export function resolveTogetherSection(slug:string){if(getTogetherSectionIds().includes(slug)) return slug;return getTogetherRegistry().legacy_aliases[slug] ?? null;}
export function togetherSectionLabel(locale:ContentLanguage,id:string){return getTogetherRegistry().sections.find(section=>section.id===id)?.labels[locale] ?? id;}
export function isTogetherParticipationSection(id:string){return getTogetherRegistry().sections.find(section=>section.id===id)?.participation ?? false;}
export function getTogetherSectionItems(repository:ContentRepository,locale:ContentLanguage,section:string){
  const owned=repository.getPublishedContent(locale).filter(item=>item.domain==="together" && item.togetherSection===section);
  const referenced=getTogetherReferenceRegistry().references.filter(reference=>reference.section===section).flatMap(reference=>repository.getContentByCanonicalId(reference.canonical_id,locale,true).filter(item=>item.domain===reference.target_domain));
  return [...owned,...referenced];
}
