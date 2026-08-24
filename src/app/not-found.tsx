import Link from "next/link";
import type { Metadata } from "next";
import { ReadingContainer } from "@/components/layout/container";

export const metadata: Metadata = {title: "404 · Paul Zhang"};

export default function NotFound() {
  return <ReadingContainer className="py-24 text-center">
    <p className="text-sm font-semibold text-primary">404</p>
    <h1 className="mt-3 font-serif text-4xl">找不到这个页面</h1>
    <p className="mt-4 text-muted-foreground">The requested page could not be found.</p>
    <Link className="mt-8 inline-flex min-h-11 items-center rounded-md border bg-surface px-5" href="/">返回首页</Link>
  </ReadingContainer>;
}
