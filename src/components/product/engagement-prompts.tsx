"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/config/i18n";
import { getProductCopy } from "@/config/product";
import { localizedPath } from "@/lib/i18n/routing";
import { emitProductEvent } from "@/lib/measurement/events";
import { advanceEngagement, ENGAGEMENT_CONFIG as CONFIG, initialEngagementState as initial, type EngagementState as State } from "@/lib/engagement/policy";

function readState() { try { return {...initial, ...JSON.parse(sessionStorage.getItem(CONFIG.storageKey) ?? "{}")} as State; } catch { return initial; } }

export function EngagementPrompts({locale}: {locale: Locale}) {
  const copy = getProductCopy(locale).prompts;
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const lastActivity = useRef(0);
  useEffect(() => {
    const timer = window.setTimeout(() => { setState(readState()); lastActivity.current = Date.now(); setReady(true); }, 0);
    return () => window.clearTimeout(timer);
  }, [locale]);
  useEffect(() => {
    if (!ready) return;
    const active = () => { lastActivity.current = Date.now(); };
    const events = ["scroll", "pointerdown", "keydown"] as const;
    events.forEach((name) => window.addEventListener(name, active, {passive: true}));
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || Date.now() - lastActivity.current > CONFIG.activeWindowMs) return;
      setState((current) => {
        const {next, fiveReached, tenReached} = advanceEngagement(current, true);
        if (fiveReached) { emitProductEvent("engagement.five_minute_reached", {locale, threshold: 300}); emitProductEvent("encouragement.shown", {locale, threshold: 300}); }
        if (tenReached) { emitProductEvent("engagement.ten_minute_reached", {locale, threshold: 600}); emitProductEvent("encouragement.shown", {locale, threshold: 600}); }
        sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(next)); return next;
      });
    }, CONFIG.tickMs);
    return () => { events.forEach((name) => window.removeEventListener(name, active)); window.clearInterval(timer); };
  }, [locale, ready]);
  const update = (changes: Partial<State>, threshold: 300 | 600, action: "dismissed" | "clicked") => setState((current) => { const next = {...current, ...changes}; sessionStorage.setItem(CONFIG.storageKey, JSON.stringify(next)); emitProductEvent(action === "dismissed" ? "encouragement.dismissed" : "encouragement.clicked", {locale, threshold}); return next; });
  const fiveVisible = ready && state.fiveMinuteShown && !state.fiveMinuteDismissed && !state.startedGrow && !state.tenMinuteShown;
  const tenVisible = ready && state.tenMinuteShown && !state.tenMinuteDismissed;
  if (!fiveVisible && !tenVisible) return null;
  return <aside aria-live="polite" aria-label={locale === "zh-CN" ? "阅读提示" : "Reading prompt"} className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-2xl rounded-lg border bg-surface p-5 shadow-2xl">
    <div className="flex items-start justify-between gap-4"><div><h2 className="font-serif text-xl">{tenVisible ? copy.tenTitle : copy.fiveTitle}</h2>{fiveVisible ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.fiveBody}</p> : null}</div>
      <button className="rounded-md px-3 py-2 text-sm underline" aria-label={copy.dismiss} onClick={() => update(tenVisible ? {tenMinuteDismissed: true} : {fiveMinuteDismissed: true}, tenVisible ? 600 : 300, "dismissed")}>{copy.dismiss}</button></div>
    <div className="mt-4 flex flex-wrap gap-3">
      {fiveVisible ? <Link className="rounded-md bg-primary px-4 py-2 text-primary-foreground" href={localizedPath("grow", locale)} onClick={() => update({startedGrow: true}, 300, "clicked")}>{copy.fiveAction}</Link> : null}
      {tenVisible ? <><button className="rounded-md border px-4 py-2" onClick={() => update({tenMinuteDismissed: true}, 600, "clicked")}>{copy.return}</button>{!state.openedStayConnected ? <a className="rounded-md border px-4 py-2" href="#stay-connected" onClick={() => update({openedStayConnected: true}, 600, "clicked")}>{copy.connect}</a> : null}{!state.openedCompanionship ? <Link className="rounded-md bg-primary px-4 py-2 text-primary-foreground" href={localizedPath("together", locale)} onClick={() => update({openedCompanionship: true}, 600, "clicked")}>{copy.companionship}</Link> : null}</> : null}
    </div>
  </aside>;
}
