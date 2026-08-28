import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("ADR-0015 accepts static export while preserving explicit production authority", () => {
  const adr = read("docs/adr/0015-production-hosting-static-export-strategy.md");
  assert.match(adr, /Status: Accepted/);
  assert.match(adr, /Human Approval: Approved/);
  assert.match(adr, /Architecture B: Next\.js Static Export \+ Cloudflare static hosting\/CDN/);
  assert.match(adr, /Architecture A: Vercel Native Next\.js \+ Cloudflare authoritative DNS/);
  assert.match(adr, /explicit production authorization/);
  assert.match(adr, /does not authorize deployment, DNS changes/);
});

test("static production contract is fail-closed and never auto-deploys main", () => {
  const config = read("next.config.ts");
  const deployment = read("docs/architecture/STATIC_PRODUCTION_DEPLOYMENT.md");
  const workflow = read(".github/workflows/architecture-validation.yml");
  assert.match(config, /output: "export"/);
  assert.match(config, /images: \{unoptimized: true\}/);
  assert.match(deployment, /Output directory \| `out`/);
  assert.match(deployment, /`main` push → automatic production is prohibited/);
  assert.match(workflow, /pnpm run build/);
  assert.match(workflow, /pnpm run validate:static-export/);
  assert.doesNotMatch(workflow, /wrangler|cloudflare\/wrangler-action|pages deploy/);
});

test("Cloudflare response contract protects previews and immutable hashed assets", () => {
  const headers = read("public/_headers");
  assert.match(headers, /\/_next\/static\/\*/);
  assert.match(headers, /max-age=31536000, immutable/);
  assert.match(headers, /:version\.:project\.pages\.dev\/\*/);
  assert.match(headers, /X-Robots-Tag: noindex/);
  assert.match(headers, /Content-Security-Policy:/);
});
