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

test("static production contract deploys only validated main builds", () => {
  const config = read("next.config.ts");
  const deployment = read("docs/architecture/STATIC_PRODUCTION_DEPLOYMENT.md");
  const workflow = read(".github/workflows/architecture-validation.yml");
  const adr = read("docs/adr/0021-automatic-main-production-deployment.md");
  assert.match(config, /output: "export"/);
  assert.match(config, /images: \{unoptimized: true\}/);
  assert.match(deployment, /Output directory \| `out`/);
  assert.match(adr, /Supersede only ADR-0015's manual-promotion policy/);
  assert.match(workflow, /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /needs: \[validate\]/);
  assert.match(workflow, /group: production-deploy/);
  assert.match(workflow, /pnpm run build/);
  assert.match(workflow, /pnpm run validate:static-export/);
  assert.match(workflow, /pages deploy out/);
  assert.match(workflow, /--project-name=paulzhang-website-preview/);
  assert.match(workflow, /--branch=production/);
  assert.match(workflow, /secrets\.CLOUDFLARE_API_TOKEN/);
  assert.match(workflow, /secrets\.CLOUDFLARE_ACCOUNT_ID/);
  assert.doesNotMatch(workflow, /echo .*CLOUDFLARE|printenv|set -x/);
});

test("Cloudflare response contract protects previews and immutable hashed assets", () => {
  const headers = read("public/_headers");
  assert.match(headers, /\/_next\/static\/\*/);
  assert.match(headers, /max-age=31536000, immutable/);
  assert.match(headers, /:version\.:project\.pages\.dev\/\*/);
  assert.match(headers, /X-Robots-Tag: noindex/);
  assert.match(headers, /Content-Security-Policy:/);
});
