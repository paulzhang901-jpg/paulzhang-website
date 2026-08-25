import type { Locale } from "@/config/i18n";
import type { JourneyId } from "@/config/product";

export const productEventNames = ["home.viewed", "home.action_opened", "journey.opened", "intent.selected", "engagement.five_minute_reached", "engagement.ten_minute_reached", "encouragement.shown", "encouragement.dismissed", "encouragement.clicked"] as const;
export type ProductEventName = (typeof productEventNames)[number];
const sources = ["hero", "home", "start", "curated", "core_entrance", "grow", "companionship", "about"] as const;
const destinations = ["start", "about", "library", "stories", "truth", "companionship", "formation", "stay_connected"] as const;
export type ProductEventPayload = {locale?: Locale; journey_id?: JourneyId; source?: (typeof sources)[number]; destination_type?: (typeof destinations)[number]; threshold?: 300 | 600};
const allowedKeys = new Set(["locale", "journey_id", "source", "destination_type", "threshold"]);
export function validateProductEventPayload(payload: Record<string, unknown>) {
  if (Object.keys(payload).some((key) => !allowedKeys.has(key))) throw new Error("Private or unregistered event payload field");
  if (payload.locale !== undefined && payload.locale !== "zh-CN" && payload.locale !== "en-US") throw new Error("Invalid event locale");
  if (payload.journey_id !== undefined && !["faith", "questions", "difficult-season", "grow", "stories", "companionship"].includes(String(payload.journey_id))) throw new Error("Invalid journey_id");
  if (payload.source !== undefined && !sources.includes(payload.source as (typeof sources)[number])) throw new Error("Invalid event source");
  if (payload.destination_type !== undefined && !destinations.includes(payload.destination_type as (typeof destinations)[number])) throw new Error("Invalid event destination_type");
  if (payload.threshold !== undefined && payload.threshold !== 300 && payload.threshold !== 600) throw new Error("Invalid engagement threshold");
  return true;
}

export function emitProductEvent(name: ProductEventName, payload: ProductEventPayload = {}) {
  validateProductEventPayload(payload);
  if (typeof window === "undefined") return;
  try {
    const key = "pz-engagement-v1";
    const state = JSON.parse(sessionStorage.getItem(key) ?? "{}");
    if (name === "intent.selected" || name === "journey.opened") state.selectedJourney = true;
    if (payload.destination_type === "formation") state.startedGrow = true;
    if (payload.destination_type === "companionship") state.openedCompanionship = true;
    if (payload.destination_type === "stay_connected") state.openedStayConnected = true;
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch { /* session storage may be unavailable; events remain ephemeral */ }
  window.dispatchEvent(new CustomEvent("paulzhang:product-event", {detail: {name, payload}}));
}
