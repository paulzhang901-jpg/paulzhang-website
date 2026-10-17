// Server-side, static-build lookup. This module does not authorize publication.
import {createHash} from "node:crypto";
import {z} from "zod";
import catalog from "../../../config/media-publishing/published-narrations.json";
import type {NormalizedContentItem} from "@/types/content";

type NarrationSource = Pick<NormalizedContentItem,
  "canonicalId" | "language" | "title" | "body" | "status" | "visibility" | "accessLevel">;
export type PublishedNarration = {src: string; audioSha256: string};
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const entry = z.object({
  canonicalId: z.string().regex(/^[a-z0-9][a-z0-9_-]*$/),
  locale: z.enum(["zh-CN", "en-US"]),
  state: z.literal("PUBLISHED"),
  kind: z.literal("production"),
  sourceSha256: hash,
  presentationSha256: hash,
  presentationPolicy: z.literal("article-narration-presentation/v1"),
  audioSha256: hash,
  voiceConfigSha256: hash,
  voiceProfileId: z.string().min(1),
  narrationVersion: z.number().int().positive(),
  publicationEventId: z.string().min(1),
  src: z.string(),
}).strict().superRefine((value, context) => {
  if (value.src !== `/media/narration/${value.audioSha256}.mp3`) {
    context.addIssue({code: "custom", path: ["src"], message: "Expected same-origin immutable MP3 URL"});
  }
});
const schema = z.object({schemaVersion: z.literal(1), records: z.array(entry)}).strict()
  .superRefine((value, context) => {
    const identities = new Set<string>();
    for (const record of value.records) {
      const key = `${record.canonicalId}:${record.locale}`;
      if (identities.has(key)) context.addIssue({code: "custom", message: "Duplicate narration identity"});
      identities.add(key);
    }
  });

export function validateNarrationCatalog(input: unknown) { return schema.parse(input); }
const published = validateNarrationCatalog(catalog);

// Additional UI-staleness fingerprint, NOT a substitute for ADR-0032 source proof.
// Uses the exact normalized body already supplied by the content repository.
export function narrationPresentationHash(item: NarrationSource): string {
  return createHash("sha256").update(JSON.stringify({
    policy: "article-narration-presentation/v1", canonicalId: item.canonicalId,
    locale: item.language, title: item.title, body: item.body,
  })).digest("hex");
}

export function resolvePublishedNarration(item: NarrationSource, input: unknown = published): PublishedNarration | undefined {
  if (item.status !== "published" || item.visibility !== "public" || item.accessLevel !== "public") return;
  const record = validateNarrationCatalog(input).records.find((candidate) =>
    candidate.canonicalId === item.canonicalId && candidate.locale === item.language);
  if (!record || record.presentationSha256 !== narrationPresentationHash(item)) return;
  return {src: record.src, audioSha256: record.audioSha256};
}
