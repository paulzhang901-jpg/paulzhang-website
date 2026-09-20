import type {ContentRepository} from "./repository";
import type {ContentLanguage} from "@/types/content";

export const growthStages = [
  {id: "explore", labels: {"zh-CN": "探索基督", "en-US": "Explore"}},
  {id: "believe", labels: {"zh-CN": "相信基督", "en-US": "Believe"}},
  {id: "abide", labels: {"zh-CN": "住在基督里", "en-US": "Abide"}},
  {id: "serve", labels: {"zh-CN": "与基督服事", "en-US": "Serve"}},
  {id: "lead", labels: {"zh-CN": "像基督带领", "en-US": "Lead"}},
  {id: "multiply", labels: {"zh-CN": "为基督倍增", "en-US": "Multiply"}},
] as const;

export type GrowthStageId = (typeof growthStages)[number]["id"];
export function growthStageLabel(locale: ContentLanguage, stage: string) { return growthStages.find((item) => item.id === stage)?.labels[locale] ?? stage; }
export function getGrowthStageIds() { return growthStages.map((item) => item.id); }
export function getGrowthStageItems(repository: ContentRepository, locale: ContentLanguage, stage: string) {
  return repository.getContentByJourneyStage(stage, locale);
}
