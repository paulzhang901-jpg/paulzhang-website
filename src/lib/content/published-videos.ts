import {approvedYoutubeVideos, officialYoutubeChannel} from "@/config/approved-youtube-videos";
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

const directRecord = z.object({
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
// ADR-0038: a single literal binding, never an arbitrary iframe URL.
const youtubeRecord = z.object({
  canonicalId: z.literal("sermon-revelation-9-20-21"), locale: z.literal("zh-CN"),
  state: z.literal("PUBLISHED"), kind: z.literal("production"),
  sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
  provider: z.literal("youtube"), videoId: z.literal("0J44f6acTeQ"),
  channelId: z.literal("UCij02113c9lnl5oZeRKbE6Q"),
  publishedAt: z.string().datetime({offset: true}),
  publicationEventId: z.literal("owner-still-unrepentant-youtube-20261020"),
}).strict();
const officialReferenceRecord = z.object({
  referenceId: z.enum(["official-hymn-this-is-my-story", "official-paul-zhang-biography"]),
  locale: z.enum(["zh-CN", "en-US"]), provider: z.literal("youtube"),
  videoId: z.enum(["PkAcmwSGzkE", "RPMMeUapK-E"]), channelId: z.literal(officialYoutubeChannel),
  state: z.literal("PUBLISHED"), kind: z.literal("production"),
  ownerAcceptance: z.object({
    previewUrl: z.string().url().regex(/^https:\/\/[a-z0-9-]+\.paulzhang-website-preview\.pages\.dev\/.*$/),
    recordedAt: z.string().datetime({offset:true}),
    evidence: z.string().min(30),
  }).strict(),
}).strict().superRefine((entry, context) => {
  const fixed = approvedYoutubeVideos[entry.videoId];
  if (fixed.referenceId !== entry.referenceId || fixed.locale !== entry.locale ||
      Date.parse(entry.ownerAcceptance.recordedAt) > Date.now())
    context.addIssue({code:"custom", message:"Unapproved official reference binding"});
});
const record = z.union([directRecord, youtubeRecord, officialReferenceRecord]);
const schema = z.object({schemaVersion: z.literal(1), records: z.array(record)}).strict()
  .superRefine((value, context) => {
    const seen = new Set<string>();
    for (const entry of value.records) {
      const key = ("canonicalId" in entry ? entry.canonicalId : entry.referenceId) + ":" + entry.locale;
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
    .filter(entry => entry.locale === locale && (!("publishedAt" in entry) || Date.parse(entry.publishedAt) <= Date.now()))
    .flatMap((entry): VideoPresentation[] => {
      if ("referenceId" in entry) {
        const fixed = approvedYoutubeVideos[entry.videoId];
        return [{referenceId: fixed.referenceId, locale, title: fixed.title,
          provider: "youtube", videoId: entry.videoId,
          detail: videoDetailPath(fixed.slug, locale),
          ...("related" in fixed ? {related: fixed.related} : {}),
        }];
      }
      const item = repository.getContentByCanonicalId(entry.canonicalId, locale)[0];
      if (!item || videoSourceHash(item) !== entry.sourceSha256) return [];
      const alternate = repository.resolvePublicTranslation(item.canonicalId, locale === "zh-CN" ? "en-US" : "zh-CN", item);
      return [{
        canonicalId: item.canonicalId, locale, title: item.title,
        alternateTitle: alternate.available ? alternate.item.title : undefined,
        scriptureRefs: item.scriptureRefs, publishedAt: entry.publishedAt,
        ...("provider" in entry ? {provider: entry.provider, videoId: entry.videoId} : {mp4: entry.mp4, poster: entry.poster, captions: entry.captions, srt: entry.srt}),
        detail: videoDetailPath(item.slug, locale),
        article: contentPath(item), audio: resolvePublishedNarration(item)?.src,
      }];
    }).sort((a, b) => Date.parse(b.publishedAt ?? "1970-01-01") - Date.parse(a.publishedAt ?? "1970-01-01"));
}

export function videoDetailPath(slug: string, locale: ContentLanguage) { return (locale === "en-US" ? "/en" : "") + "/videos/" + slug; }
