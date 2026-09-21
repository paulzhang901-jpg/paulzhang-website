import fs from "node:fs";
import path from "node:path";
import type {ContentRepository} from "./repository";
import type {ContentLanguage} from "@/types/content";

type TogetherRegistry={version:number;sections:Array<{id:string;labels:Record<ContentLanguage,string>;participation:boolean}>;legacy_aliases:Record<string,string>};
let registry:TogetherRegistry|undefined;
export function getTogetherRegistry(){registry ??= JSON.parse(fs.readFileSync(path.join(process.cwd(),"config/architecture/together.yaml"),"utf8")) as TogetherRegistry;return registry;}
export function getTogetherSectionIds(){return getTogetherRegistry().sections.map(({id})=>id);}
export function getTogetherRouteSlugs(){return [...getTogetherSectionIds(),...Object.keys(getTogetherRegistry().legacy_aliases)];}
export function resolveTogetherSection(slug:string){if(getTogetherSectionIds().includes(slug)) return slug;return getTogetherRegistry().legacy_aliases[slug] ?? null;}
export function togetherSectionLabel(locale:ContentLanguage,id:string){return getTogetherRegistry().sections.find(section=>section.id===id)?.labels[locale] ?? id;}
export function isTogetherParticipationSection(id:string){return getTogetherRegistry().sections.find(section=>section.id===id)?.participation ?? false;}
export function getTogetherSectionItems(repository:ContentRepository,locale:ContentLanguage,section:string){return repository.getPublishedContent(locale).filter(item=>item.domain==="together" && item.togetherSection===section);}
