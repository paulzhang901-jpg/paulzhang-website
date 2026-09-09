import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import registry from "../../../config/content/sermons/publication-runtime.json";

export type PublishedSermon = {title: string; subtitle: string; scriptureRange: string; sermonSeries: string; themes: string[]; body: string};

// Publication-safe field projection of the governed records. Canonical bodies
// remain in the existing materialized content; private source/review files stay out.
export function loadPublishedSermon(sermonId: string): PublishedSermon | null {
  const record = registry.records.find((entry) => entry.sermonId === sermonId);
  if (!record || record.publicationStatus !== "PUBLISHED" || record.humanPreviewStatus !== "APPROVED" || record.hashVerification !== "VERIFIED" || record.searchEligibility !== true) return null;
  if (!/^\/library\/[a-z0-9-]+$/.test(record.publicRoute) || record.runtimeContentPath !== `content/zh-CN${record.publicRoute}.mdx`) throw new Error("Invalid published sermon route binding");
  const source = fs.readFileSync(path.join(process.cwd(), record.runtimeContentPath));
  const delimiter = Buffer.from("\n---\n");
  const end = source.indexOf(delimiter, 4);
  if (!source.subarray(0, 4).equals(Buffer.from("---\n")) || end < 0) throw new Error("Invalid sermon materialization");
  const bytes = source.subarray(end + delimiter.length);
  if (crypto.createHash("sha256").update(bytes).digest("hex") !== record.canonicalEditionHash) throw new Error("Canonical sermon hash mismatch");
  return {title: record.title, subtitle: record.subtitle, scriptureRange: record.scriptureRange, sermonSeries: record.sermonSeries, themes: [...record.themes], body: bytes.toString("utf8")};
}
