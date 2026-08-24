import type { ReactNode } from "react";

export function Section({children, className = ""}: {children: ReactNode; className?: string}) {
  return <section className={`py-[var(--space-section)] ${className}`}>{children}</section>;
}

export function SectionHeading({eyebrow, title, children}: {eyebrow?: string; title: string; children?: ReactNode}) {
  return <header className="mb-8 max-w-2xl">
    {eyebrow ? <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p> : null}
    <h1 className="font-serif text-4xl leading-tight sm:text-5xl" style={{textWrap: "balance"}}>{title}</h1>
    {children ? <div className="mt-5 text-lg leading-8 text-muted-foreground">{children}</div> : null}
  </header>;
}
