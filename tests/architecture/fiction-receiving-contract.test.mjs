import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const identities = read('config/fiction/work-identities.json');
const covers = read('config/fiction/cover-manifest.json');
const guardrails = read('config/fiction/rights-guardrails.json');

const approvedTitles = [
  '以诺：长生纪元', '看不见的战争·超级算法', '逃到旷野的人', '乌鸦每天都会来',
  '山洞里的声音', '最后一块饼', '火没有降下来', '一直没有下雨',
  '他一直低着头', '谁杀了先知', '还有七千人', '风过去以后'
];

test('fiction receiving contract fixes exactly the twelve approved identities', () => {
  assert.equal(identities.works.length, 12);
  assert.deepEqual(identities.works.map((work) => work.canonicalTitle), approvedTitles);
  assert.deepEqual(identities.works.map((work) => work.order), Array.from({length: 12}, (_, index) => index + 1));
  assert.equal(identities.works.find((work) => work.canonicalTitle === '火没有降下来').canonicalVersion, 'v3');
  assert.deepEqual(identities.excludedTitles, ['为什么偏偏是我', '每个人都来安慰他']);
});

test('all cover mappings remain explicitly blocked until verified source assets arrive', () => {
  assert.equal(covers.entries.length, 12);
  assert.deepEqual(covers.entries.map((entry) => entry.canonicalTitle), approvedTitles);
  for (const entry of covers.entries) {
    assert.equal(entry.asset, null);
    assert.equal(entry.verificationStatus, 'COVER_MAPPING_BLOCKED');
  }
});

test('rights contract forbids distribution surfaces and non-LOCKED public records', () => {
  assert.equal(guardrails.productBoundary, 'discovery_and_official_reading_router_only');
  assert.equal(guardrails.requiredEditorialStatus, 'LOCKED');
  for (const field of ['body', 'chapters', 'manuscriptPath', 'contractPath', 'internalRightsAnalysis']) {
    assert.ok(guardrails.prohibitedPublicFields.includes(field), `missing prohibited field ${field}`);
  }
  for (const segment of ['chapter', 'read', 'download', 'manuscript', 'contract']) {
    assert.ok(guardrails.prohibitedRouteSegments.includes(segment), `missing prohibited route ${segment}`);
  }
  assert.deepEqual(guardrails.supersededVersions, [{canonicalTitle: '火没有降下来', versions: ['v1', 'v2']}]);
});

test('ADR-0014 is human-approved and physical intake remains outside public content', () => {
  const adr = fs.readFileSync('docs/adr/0014-mu-changke-fiction-portfolio-route.md', 'utf8');
  assert.match(adr, /Status: Accepted/);
  assert.match(adr, /Human Approval: Approved 2026-08-27/);
  for (const directory of [
    'canonical-registry',
    'editorial-packages',
    'covers/assets',
    'internal-rights'
  ]) {
    assert.ok(fs.statSync(`config/fiction/intake/${directory}`).isDirectory(), `missing intake directory ${directory}`);
  }
  assert.equal(fs.existsSync('content/fiction'), false);
  assert.equal(fs.existsSync('public/fiction'), false);
});
