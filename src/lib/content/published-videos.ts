import { createHash } from "node:crypto";
import { z } from "zod";
import catalog from "../../../config/media-publishing/published-videos.json";
import type { ContentLanguage, NormalizedContentItem } from "@/types/content";
import type { ContentRepository } from "./repository";
import { contentPath } from "./paths";
import { resolvePublishedNarration } from "./published-narrations";
import type { VideoPresentation } from "@/components/content/videos-section";

function mediaUrl(extension: string) {
  return z.string().refine(value => {
    if (/[\\\s]/.test(value) || value.startsWith("//")) return false;
    try {
      const local = value.startsWith("/");
      const url = new URL(value, "https://paulzhang.org");
      return (local || url.protocol === "https:") && !url.username && !url.password &&
        !/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/i.test(url.hostname) &&
        new RegExp("\\.(" + extension + ")$", "i").test(url.pathname);
    } catch { return false; }
  }, "Expected independent HTTPS or same-origin media URL");
}

const record = z.object({
  canonicalId: z.string().regex(/^[a-z0-9][a-z0-9_-]*$/),
  locale: z.enum(["zh-CN", "en-US"]),
  state: z.literal("PUBLISHED"),
  kind: z.literal("production"),
  sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
  mp4: mediaUrl("mp4"),
  poster: mediaUrl("jpg|jpeg|png|webp|avif"),
  captions: mediaUrl("vtt"),
  srt: mediaUrl("srt").optional(),
  publishedAt: z.string().datetime({offset: true}),
  publicationEventId: z.string().min(1),
}).strict();
const schema = z.object({schemaVersion: z.literal(1), records: z.array(record)}).strict()
  .superRefine((value, context) => {
    const seen = new Set<string>();
    for (const entry of value.records) {
      const key = entry.canonicalId + ":" + entry.locale;
      if (seen.has(key)) context.addIssue({code: "custom", message: "Duplicate video identity"});
      seen.add(key);
    }
  });

// Validation and hashes detect malformed/stale metadata, not author identity.
// Catalog bindings require a separately reviewed media release (ADR-0036 for True Faith).
export function validateVideoCatalog(input: unknown) { return schema.parse(input); }
const published = validateVideoCatalog(catalog);

export function videoSourceHash(item: NormalizedContentItem): string {
  return createHash("sha256").update(JSON.stringify({
    policy: "canonical-video-presentation/v1", canonicalId: item.canonicalId,
    locale: item.language, title: item.title, body: item.body, scriptureRefs: item.scriptureRefs,
  })).digest("hex");
}

export function getPublishedVideos(repository: ContentRepository, locale: ContentLanguage, input: unknown = published): VideoPresentation[] {
  return validateVideoCatalog(input).records
    .filter(entry => entry.locale === locale && Date.parse(entry.publishedAt) <= Date.now())
    .flatMap(entry => {
      const item = repository.getContentByCanonicalId(entry.canonicalId, locale)[0];
      if (!item || videoSourceHash(item) !== entry.sourceSha256) return [];
      const alternate = repository.resolvePublicTranslation(item.canonicalId, locale === "zh-CN" ? "en-US" : "zh-CN", item);
      return [{
        canonicalId: item.canonicalId, locale, title: item.title,
        alternateTitle: alternate.available ? alternate.item.title : undefined,
        scriptureRefs: item.scriptureRefs, publishedAt: entry.publishedAt,
        mp4: entry.mp4, poster: entry.poster, captions: entry.captions,
        detail: videoDetailPath(item.slug, locale), srt: entry.srt,
        article: contentPath(item), audio: resolvePublishedNarration(item)?.src,
      }];
    }).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function videoDetailPath(slug: string, locale: ContentLanguage) { return (locale === "en-US" ? "/en" : "") + "/videos/" + slug; }
