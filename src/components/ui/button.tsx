import Link from "next/link";
import type { Route } from "next";
import type { ComponentProps, ReactNode } from "react";

const base = "inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 font-medium transition-colors focus-visible:outline-none";
const variants = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "border bg-surface text-foreground hover:bg-muted",
} as const;

type ButtonProps = ComponentProps<"button"> & {variant?: keyof typeof variants};

export function Button({variant = "primary", className = "", ...props}: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({href, children, variant = "primary"}: {href: Route; children: ReactNode; variant?: keyof typeof variants}) {
  return <Link href={href} className={`${base} ${variants[variant]}`}>{children}</Link>;
}
