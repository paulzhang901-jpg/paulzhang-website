import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
test('Home preserves approved copy, image roles, section order, and three entrances', () => {
  const home = read('src/components/product/home-page.tsx'); const copy = read('src/config/product.ts');
  assert.match(copy, /在真理中扎根/); assert.match(copy, /Rooted in Truth/);
  assert.match(home, /paul-hero-outdoor\.jpg/); assert.match(home, /paul-companionship-study\.jpg/);
  const sections = [...home.matchAll(/data-home-section="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(sections, ['hero','trust','start','entrances','featured','grow','companionship','about','stay-connected']);
  assert.match(home, /\[\s*\["truth", "library"\], \["stories", "stories"\], \["companionship", "together"\]\s*\]/);
});
test('Start routes expose six approved experience journeys without zh prefix', () => {
  const product = read('src/config/product.ts'); const routes = JSON.parse(read('config/architecture/routes.yaml'));
  assert.deepEqual(routes.child_routes['/start'], ['faith','questions','difficult-season','grow','stories','companionship']);
  assert.doesNotMatch(product, /"\/zh/); assert.equal(fs.existsSync('src/app/(zh)/start/[journey]/page.tsx'), true); assert.equal(fs.existsSync('src/app/(en)/en/start/[journey]/page.tsx'), true);
});
test('curated product content binds canonical IDs through repository helper', () => {
  const config = read('src/config/product.ts'); const helper = read('src/lib/product/content.ts');
  assert.match(config, /truth-foundation-001/); assert.match(config, /life-story-sample-001/); assert.match(helper, /getContentByCanonicalId/); assert.doesNotMatch(read('src/components/product/home-page.tsx'), /zhenli-yuedu-shili|truth-reading-sample|xiaomaizi-shili/);
});
test('engagement prompt is nonblocking and accessible', () => { const prompt = read('src/components/product/engagement-prompts.tsx'); assert.match(prompt, /aria-live="polite"/); assert.match(prompt, /aria-label=\{copy\.dismiss\}/); assert.doesNotMatch(prompt, /role="dialog"|aria-modal/); });
