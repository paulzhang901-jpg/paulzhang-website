import type { NormalizedContentItem } from "@/types/content";
import { isPublicContent } from "./normalize";

const overlap = (left: string[], right: string[]) => left.filter((value) => right.includes(value)).length;

export function findRelatedContent(item: NormalizedContentItem, candidates: NormalizedContentItem[], limit = 4) {
  const eligible = candidates.filter(isPublicContent).filter((candidate) =>
    candidate.id !== item.id && candidate.language === item.language,
  );
  const byCanonical = new Map(eligible.map((candidate) => [candidate.canonicalId, candidate]));
  const explicit = item.relatedContent.flatMap((id) => byCanonical.get(id) ? [byCanonical.get(id)!] : []);
  const explicitIds = new Set(explicit.map((candidate) => candidate.id));
  const inferred = eligible.filter((candidate) => !explicitIds.has(candidate.id)).sort((a, b) => {
    const aRank = [overlap(item.lifeNeeds, a.lifeNeeds), overlap(item.topics, a.topics), overlap(item.journeyStages, a.journeyStages), overlap(item.audiences, a.audiences)];
    const bRank = [overlap(item.lifeNeeds, b.lifeNeeds), overlap(item.topics, b.topics), overlap(item.journeyStages, b.journeyStages), overlap(item.audiences, b.audiences)];
    for (let index = 0; index < aRank.length; index += 1) if (aRank[index] !== bRank[index]) return bRank[index] - aRank[index];
    return b.publishedAt.getTime() - a.publishedAt.getTime() || a.canonicalId.localeCompare(b.canonicalId);
  }).filter((candidate) =>
    overlap(item.lifeNeeds, candidate.lifeNeeds) + overlap(item.topics, candidate.topics) + overlap(item.journeyStages, candidate.journeyStages) + overlap(item.audiences, candidate.audiences) > 0,
  );
  return [...explicit, ...inferred].slice(0, limit);
}
