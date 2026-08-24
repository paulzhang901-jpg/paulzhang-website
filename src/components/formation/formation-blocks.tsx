import type { ReactNode } from "react";
import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

function FormationBlock({title, children, tone = "growth"}: {title: string; children: ReactNode; tone?: "truth" | "growth" | "companionship"}) {
  const colors = {truth: "border-l-[var(--color-truth)]", growth: "border-l-[var(--color-growth)]", companionship: "border-l-[var(--color-companionship)]"};
  return <aside className={`my-8 border-l-4 bg-surface p-6 ${colors[tone]}`}><h2 className="font-serif text-xl">{title}</h2><div className="mt-3 leading-7 text-muted-foreground">{children}</div></aside>;
}

export function ScriptureBlock(props: {title: string; children: ReactNode}) { return <FormationBlock {...props} tone="truth" />; }
export function ReflectionBlock(props: {title: string; children: ReactNode}) { return <FormationBlock {...props} />; }
export function PracticeBlock(props: {title: string; children: ReactNode}) { return <FormationBlock {...props} />; }
export function PrayerBlock(props: {title: string; children: ReactNode}) { return <FormationBlock {...props} tone="companionship" />; }

export function NextStepCTA({title, body, href, label}: {title: string; body: string; href: Route; label: string}) {
  return <Card><h2 className="font-serif text-2xl">{title}</h2><p className="my-4 leading-7 text-muted-foreground">{body}</p><LinkButton href={href}>{label}</LinkButton></Card>;
}

export const CompanionshipCTA = NextStepCTA;
