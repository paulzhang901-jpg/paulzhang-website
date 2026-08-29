import assert from "node:assert/strict";
import test from "node:test";
import { metadataForCollectionRoute } from "../../src/lib/seo/metadata";
import { getCollectionSlugs, getGrowthStages } from "../../src/lib/routing/resolvers";

const siteUrl = "https://paulzhang.org";
const collections = [
  {routeId: "library" as const, slugs: getCollectionSlugs("/library")},
  {routeId: "stories" as const, slugs: getCollectionSlugs("/stories")},
  {routeId: "grow" as const, slugs: getGrowthStages()},
];

test("all paired collection routes expose self canonical and complete locale alternates", () => {
  for (const {routeId, slugs} of collections) {
    for (const slug of slugs) {
      for (const locale of ["zh-CN", "en-US"] as const) {
        const metadata = metadataForCollectionRoute(routeId, slug, locale);
        const prefix = locale === "en-US" ? "/en" : "";
        const languages = metadata.alternates?.languages as Record<string, string>;

        assert.equal(String(metadata.alternates?.canonical), `${siteUrl}${prefix}/${routeId}/${slug}`);
        assert.equal(String(languages["zh-CN"]), `${siteUrl}/${routeId}/${slug}`);
        assert.equal(String(languages["en-US"]), `${siteUrl}/en/${routeId}/${slug}`);
      }
    }
  }
});
