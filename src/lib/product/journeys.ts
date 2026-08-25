import fs from "node:fs";
import path from "node:path";
import { journeyIds, type JourneyId } from "@/config/product";

export type JourneyDefinition = {journey_id: JourneyId; destination: string; primary_experience: string; secondary_experience: string | null; taxonomy_mapping: Record<string, string[]>; featured_content: string[]; relationship_weight: "weak" | "medium" | "strong"};
type Registry = {version: number; journeys: JourneyDefinition[]};
let registry: Registry | undefined;
export function getJourneyRegistry() { registry ??= JSON.parse(fs.readFileSync(path.join(process.cwd(), "config/architecture/journeys.yaml"), "utf8")) as Registry; return registry; }
export function isJourneyId(value: string): value is JourneyId { return journeyIds.includes(value as JourneyId); }
export function getJourney(id: JourneyId) { const item = getJourneyRegistry().journeys.find((candidate) => candidate.journey_id === id); if (!item) throw new Error(`Unknown journey: ${id}`); return item; }
