import {readFile} from 'node:fs/promises';
import {runMockGeneration,MockToneProvider} from '../../src/lib/media-publishing/core.mjs';
const locale=process.argv[2];
if (!['zh-CN','en-US'].includes(locale)) throw new Error('Usage: node scripts/media-publishing/mock-pilot.mjs zh-CN|en-US');
const config=JSON.parse(await readFile('config/media-publishing/pilot.json','utf8'));
config.language=locale;
const result=await runMockGeneration({sourcePath:`content/${locale}/library/true-freedom.mdx`,config,outputDirectory:'/tmp/paul-media-mock-pilot',provider:new MockToneProvider()});
console.log(JSON.stringify({cacheHit:result.cacheHit,canonical_id:result.manifest.canonical_id,language:locale,generation_status:'mock',warning:'TEST TONE ONLY, NOT ARTICLE NARRATION',costUsd:0},null,2));
