import { notFound } from "next/navigation";
import { ContentUnitPage } from "@/components/content/content-work-page";
import { metadataForUnit } from "@/lib/content/works/metadata";
import { getContentWorkRepository } from "@/lib/content/works/repository";
import { getUnitStaticParams, resolveUnitRoute } from "@/lib/content/works/routing";

type Props = {params: Promise<{slug: string; unitSlug: string}>};
export const dynamicParams = false;
export async function generateStaticParams() { return (await getUnitStaticParams("en-US", await getContentWorkRepository())).map(({workSlug, unitSlug}) => ({slug: workSlug, unitSlug})); }
export async function generateMetadata({params}: Props) {
  const repository = await getContentWorkRepository();
  const {slug, unitSlug} = await params;
  const result = resolveUnitRoute(slug, unitSlug, "en-US", repository);
  return result.kind === "unit" ? metadataForUnit(result.work, result.representation, result.unit, repository) : {};
}
export default async function Page({params}: Props) {
  const repository = await getContentWorkRepository();
  const {slug, unitSlug} = await params;
  const result = resolveUnitRoute(slug, unitSlug, "en-US", repository);
  if (result.kind === "not-found") notFound();
  return <ContentUnitPage work={result.work} workRepresentation={result.representation} unit={result.unit} repository={repository} />;
}
