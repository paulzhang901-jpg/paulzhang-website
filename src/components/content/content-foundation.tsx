import type { ReactNode } from "react";
import { Badge } from "@/components/ui/primitives";
import { Card } from "@/components/ui/card";

export function ContentCard({title, summary, meta}: {title: string; summary: string; meta?: string}) {
  return <Card><article><ContentMeta>{meta}</ContentMeta><h2 className="mt-3 font-serif text-2xl">{title}</h2><p className="mt-3 leading-7 text-muted-foreground">{summary}</p></article></Card>;
}

export const ArticleCard = ContentCard;
export const StoryCard = ContentCard;

export function ContentMeta({children}: {children?: ReactNode}) {
  return children ? <div className="text-sm text-muted-foreground">{children}</div> : null;
}

export function TopicBadge({children}: {children: ReactNode}) { return <Badge>{children}</Badge>; }
export function ReadingTime({minutes}: {minutes: number}) { return <span>{minutes} min</span>; }
