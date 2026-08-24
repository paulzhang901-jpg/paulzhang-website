import type { ReactNode } from "react";

export function Container({children, className = ""}: {children: ReactNode; className?: string}) {
  return <div className={`mx-auto w-full max-w-[var(--container-site)] px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function ReadingContainer({children, className = ""}: {children: ReactNode; className?: string}) {
  return <div className={`mx-auto w-full max-w-[var(--container-reading)] px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function WideContainer({children, className = ""}: {children: ReactNode; className?: string}) {
  return <div className={`mx-auto w-full max-w-[90rem] px-5 sm:px-8 ${className}`}>{children}</div>;
}
