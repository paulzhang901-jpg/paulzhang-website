export const ENGAGEMENT_CONFIG = {tickMs: 1000, activeWindowMs: 30_000, fiveSeconds: 300, tenSeconds: 600, storageKey: "pz-engagement-v1"} as const;
export type EngagementState = {seconds: number; fiveMinuteShown: boolean; fiveMinuteDismissed: boolean; tenMinuteShown: boolean; tenMinuteDismissed: boolean; startedGrow: boolean; openedCompanionship: boolean; openedStayConnected: boolean; selectedJourney: boolean};
export const initialEngagementState: EngagementState = {seconds: 0, fiveMinuteShown: false, fiveMinuteDismissed: false, tenMinuteShown: false, tenMinuteDismissed: false, startedGrow: false, openedCompanionship: false, openedStayConnected: false, selectedJourney: false};

export function advanceEngagement(current: EngagementState, eligible: boolean) {
  if (!eligible) return {next: current, fiveReached: false, tenReached: false};
  const next = {...current, seconds: current.seconds + 1};
  const fiveReached = next.seconds >= ENGAGEMENT_CONFIG.fiveSeconds && !next.fiveMinuteShown && !next.fiveMinuteDismissed && !next.startedGrow;
  const tenReached = next.seconds >= ENGAGEMENT_CONFIG.tenSeconds && !next.tenMinuteShown && !next.tenMinuteDismissed;
  if (fiveReached) next.fiveMinuteShown = true;
  if (tenReached) next.tenMinuteShown = true;
  return {next, fiveReached, tenReached};
}
