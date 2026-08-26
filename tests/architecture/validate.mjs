import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
export const assert = (condition, message) => { if (!condition) throw new Error(message); };
export const unique = (values, label) => assert(new Set(values).size === values.length, `${label} contains duplicates`);

export function validate() {
  const routes = read('config/architecture/routes.yaml');
  const taxonomy = read('config/architecture/taxonomy.yaml');
  const events = read('config/architecture/events.yaml');
  const journey = read('config/architecture/journey-states.yaml');
  const productJourneys = read('config/architecture/journeys.yaml');

  for (const file of ['content','content-work','content-unit','taxonomy','events','user-journey','routes']) read(`schema/${file}.schema.json`);

  assert(routes.version === 1, 'route registry version must be 1');
  assert(routes.locale_strategy.default_locale === 'zh-CN', 'default locale must be zh-CN');
  assert(routes.locale_strategy.locale_prefixes['en-US'] === '/en', 'en-US prefix must be /en');
  assert(routes.locale_strategy.forbidden_prefixes.includes('/zh'), '/zh must remain forbidden');
  assert(routes.locale_strategy.forced_browser_redirects === false, 'forced browser redirects must remain disabled');
  unique(routes.top_level_routes.map((route) => route.path), 'top-level routes');
  const requiredRoutes = ['/', '/start', '/library', '/stories', '/together', '/grow', '/community', '/about', '/gccm', '/search', '/ask', '/journey', '/account', '/auth', '/api', '/legal', '/admin'];
  for (const route of requiredRoutes) assert(routes.top_level_routes.some((item) => item.path === route), `missing reserved route ${route}`);
  for (const [parent, children] of Object.entries(routes.child_routes)) {
    assert(routes.top_level_routes.some((item) => item.path === parent), `child parent ${parent} is not registered`);
    unique(children, `children of ${parent}`);
    children.forEach((value) => assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), `invalid child route ${parent}/${value}`));
  }
  for (const [pathPattern, entity] of [['/stories/[work-slug]','content_work'],['/stories/[work-slug]/[unit-slug]','content_unit']]) {
    const pattern = routes.patterns.find((item) => item.path === pathPattern);
    assert(pattern?.entity === entity && pattern.release === 'v1', `missing content work route pattern ${pathPattern}`);
  }

  for (const key of ['content_types','work_types','unit_types','topics','life_needs','journey_stages','audiences']) {
    unique(taxonomy[key], key);
    taxonomy[key].forEach((value) => assert(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(value), `invalid ${key} value ${value}`));
  }
  assert(taxonomy.work_types.includes('story_book'), 'story_book work type missing');
  assert(!taxonomy.content_types.includes('story_book'), 'story_book must not be an ordinary ContentItem type');
  assert(JSON.stringify(taxonomy.journey_stages) === JSON.stringify(['explore','believe','abide','serve','lead','multiply']), 'canonical journey stages changed');

  const eventKeys = events.events.map(({name, version}) => `${name}@${version}`);
  unique(eventKeys, 'event name/version pairs');
  for (const event of events.events) {
    for (const field of ['name','version','domain','release','contains_sensitive_data','description']) assert(Object.hasOwn(event, field), `event missing ${field}`);
    assert(/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/.test(event.name), `invalid event name ${event.name}`);
    assert(event.contains_sensitive_data === false, `${event.name} must not contain sensitive data`);
  }

  unique(journey.states, 'journey states');
  const stateSet = new Set(journey.states);
  for (const transition of journey.transitions) {
    assert(stateSet.has(transition.from) && stateSet.has(transition.to), `unknown transition state ${transition.from} -> ${transition.to}`);
  }
  for (const [from, to] of [['participant','companion'],['companion','disciple_maker']]) {
    const transition = journey.transitions.find((item) => item.from === from && item.to === to);
    assert(transition?.validation === 'human_required', `${from} -> ${to} must require human validation`);
  }
  const journeyIds = productJourneys.journeys.map((item) => item.journey_id);
  unique(journeyIds, 'product journey IDs');
  assert(JSON.stringify(journeyIds) === JSON.stringify(['faith','questions','difficult-season','grow','stories','companionship']), 'approved product journeys changed');
  const taxonomyValues = new Set([...taxonomy.topics, ...taxonomy.life_needs, ...taxonomy.journey_stages]);
  for (const item of productJourneys.journeys) {
    assert(routes.child_routes['/start'].includes(item.journey_id), `journey route missing ${item.journey_id}`);
    for (const values of Object.values(item.taxonomy_mapping)) values.forEach((value) => assert(taxonomyValues.has(value), `journey ${item.journey_id} references unknown taxonomy ${value}`));
  }
  return {routes: routes.top_level_routes.length, events: events.events.length, states: journey.states.length};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log('Architecture validation PASS', validate());
