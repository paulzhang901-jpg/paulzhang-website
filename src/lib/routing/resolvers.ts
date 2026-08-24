import fs from "node:fs";
import path from "node:path";
import type { ContentRepository } from "@/lib/content/repository";
import { getTaxonomyRegistry } from "@/lib/taxonomy/registry";
import type { ContentLanguage, NormalizedContentItem } from "@/types/content";

type CollectionResolution = {kind: "collection"; slug: string};
type ContentResolution = {kind: "content"; item: NormalizedContentItem};
export type DynamicRouteResolution = CollectionResolution | ContentResolution | {kind: "not-found"};

type RouteRegistry = {child_routes: Record<string, string[]>};
let routeRegistry: RouteRegistry | undefined;
function getRouteRegistry(): RouteRegistry {
  routeRegistry ??= JSON.parse(fs.readFileSync(path.join(process.cwd(), "config/architecture/routes.yaml"), "utf8")) as RouteRegistry;
  return routeRegistry;
}

export function getCollectionSlugs(route: "/library" | "/stories") {
  return [...(getRouteRegistry().child_routes[route] ?? [])];
}

export function getGrowthStages() {
  return [...getTaxonomyRegistry().journey_stages];
}

export function resolveLibrarySlug(slug: string, language: ContentLanguage, repository: ContentRepository): DynamicRouteResolution {
  if (getRouteRegistry().child_routes["/library"]?.includes(slug)) return {kind: "collection", slug};
  const item = repository.getContentBySlug("library", slug, language);
  return item ? {kind: "content", item} : {kind: "not-found"};
}

export function resolveStorySlug(slug: string, language: ContentLanguage, repository: ContentRepository): DynamicRouteResolution {
  if (getRouteRegistry().child_routes["/stories"]?.includes(slug)) return {kind: "collection", slug};
  const item = repository.getContentBySlug("stories", slug, language);
  return item ? {kind: "content", item} : {kind: "not-found"};
}

export function resolveGrowthStage(stage: string): DynamicRouteResolution {
  return getTaxonomyRegistry().journey_stages.includes(stage) ? {kind: "collection", slug: stage} : {kind: "not-found"};
}
