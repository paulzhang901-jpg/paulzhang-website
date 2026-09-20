import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import registry from "../../../config/content/sermons/publication-runtime.json";

export type PublishedSermon = {title: string; subtitle: string; scriptureRange: string; sermonSeries: string; themes: string[]; body: string};

// Publication-safe field projection of the governed records. Canonical bodies
// remain in the existing materialized content; private source/review files stay out.
export function loadPublishedSermon(sermonId: string, locale: "zh-CN" | "en-US" = "zh-CN"): PublishedSermon | null {
  const record = registry.records.find((entry) => entry.sermonId === sermonId);
  if (!record || record.publicationStatus !== "PUBLISHED" || record.hashVerification !== "VERIFIED" || record.searchEligibility !== true) return null;
  const directPublicationApproval = record.humanPreviewStatus === "WAIVED_BY_AUTHOR" && "publicationApproval" in record && record.publicationApproval === "AUTHOR_DIRECT_AUTHORIZATION";
  if (record.humanPreviewStatus !== "APPROVED" && !directPublicationApproval) return null;
  const localRoute = locale === "en-US" ? record.publicRoute.replace(/^\/en(?=\/)/, "") : record.publicRoute;
  if (!/^\/library\/[a-z0-9-]+$/.test(localRoute) || record.publicRoute !== `${locale === "en-US" ? "/en" : ""}${localRoute}` || record.runtimeContentPath !== `content/${locale}${localRoute}.mdx`) throw new Error("Invalid published sermon route binding");
  if (locale === "en-US") {
    const chinese = registry.records.find((entry) => "sourceSermonId" in record && entry.sermonId === record.sourceSermonId);
    if (!chinese || !("sourceCanonicalEditionHash" in record) || chinese.canonicalEditionHash !== record.sourceCanonicalEditionHash) throw new Error("English sermon source binding mismatch");
    if (!loadPublishedSermon(chinese.sermonId)) throw new Error("English sermon source is not published");
  }
  const source = fs.readFileSync(path.join(process.cwd(), record.runtimeContentPath));
  if (directPublicationApproval) {
    const {data} = matter(source.toString("utf8"));
    if (data.status !== "published" || data.visibility !== "public" || data.access_level !== "public" || !data.published_at) return null;
    if (data.id !== sermonId || data.language !== locale || localRoute !== `/library/${data.slug}`) throw new Error("Direct publication identity mismatch");
  }
  if (locale === "en-US") {
    const {data} = matter(source.toString("utf8"));
    if (data.status !== "published" || data.visibility !== "public" || data.access_level !== "public" || !data.published_at) return null;
    if (data.id !== sermonId || data.language !== locale || !("sourceSermonId" in record) || data.canonical_id !== record.sourceSermonId || localRoute !== `/library/${data.slug}`) throw new Error("English sermon canonical identity mismatch");
  }
  const delimiter = Buffer.from("\n---\n");
  const end = source.indexOf(delimiter, 4);
  if (!source.subarray(0, 4).equals(Buffer.from("---\n")) || end < 0) throw new Error("Invalid sermon materialization");
  const bytes = source.subarray(end + delimiter.length);
  if (crypto.createHash("sha256").update(bytes).digest("hex") !== record.canonicalEditionHash) throw new Error("Canonical sermon hash mismatch");
  return {title: record.title, subtitle: record.subtitle, scriptureRange: record.scriptureRange, sermonSeries: record.sermonSeries, themes: [...record.themes], body: bytes.toString("utf8")};
}
