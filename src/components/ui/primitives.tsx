import type { ComponentProps, ReactNode } from "react";

export function Badge({children}: {children: ReactNode}) {
  return <span className="inline-flex rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground">{children}</span>;
}

export function Divider() { return <hr className="my-8 border-t" />; }

export function Stack({children, className = ""}: {children: ReactNode; className?: string}) {
  return <div className={`flex flex-col gap-5 ${className}`}>{children}</div>;
}

export function Inline({children, className = ""}: {children: ReactNode; className?: string}) {
  return <div className={`flex flex-wrap items-center gap-3 ${className}`}>{children}</div>;
}

export function VisuallyHidden(props: ComponentProps<"span">) {
  return <span className="sr-only" {...props} />;
}
