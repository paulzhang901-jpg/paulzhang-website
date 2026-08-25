"use client";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { emitProductEvent, type ProductEventName, type ProductEventPayload } from "@/lib/measurement/events";

export function TrackedLink({href, children, event, payload, className = ""}: {href: Route; children: ReactNode; event: ProductEventName; payload?: ProductEventPayload; className?: string}) {
  return <Link href={href} className={className} onClick={() => emitProductEvent(event, payload)}>{children}</Link>;
}
