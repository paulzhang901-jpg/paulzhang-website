import type { ReactNode } from "react";

export function Card({children, className = ""}: {children: ReactNode; className?: string}) {
  return <div className={`rounded-lg border bg-surface p-6 shadow-[var(--shadow-soft)] ${className}`}>{children}</div>;
}
