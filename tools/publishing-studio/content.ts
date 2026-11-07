import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import {contentFrontmatterSchema} from '../../src/lib/content/schema';
import {validateTaxonomy} from '../../src/lib/taxonomy/registry';
import {validateMdxSource} from '../../src/lib/content/mdx-safety';
import {discoverAndParseContent} from '../../src/lib/content/discovery';
import {validateContentRecords} from '../../src/lib/content/validation';
import {contentPath} from '../../src/lib/content/paths';
import {digest} from './store';
export type Proposal={domain:string;metadata?:Record<string,unknown>};
export function splitSource(source:string) {
 if(source.startsWith('\uFEFF')) throw Error('Remove UTF-8 BOM before approval');
 if(!source.startsWith('---'))return {metadata:{},body:source};
 const match=/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
 if(!match)throw Error('Malformed YAML frontmatter');
 // No language tags: gray-matter must never select an executable engine.
 const parsed=matter(source);return {metadata:parsed.data,body:source.slice(match[0].length)};
}
export function prepare(source:string,proposal:Proposal,repo=process.cwd(),resume?:{destination:string;outputHash:string}) {
 if(!['library','stories'].includes(proposal.domain))throw Error('Phase 1 supports library/stories articles only');
 const parsed=splitSource(source);
 const metadata=contentFrontmatterSchema.parse({...parsed.metadata,...proposal.metadata});
 if(metadata.language!=='zh-CN'||metadata.content_type!=='article'||metadata.status!=='published'||metadata.visibility!=='public'||metadata.access_level!=='public')throw Error('Only explicitly public published zh-CN articles supported');
 if(!parsed.body.trim())throw Error('Empty body');
 const errors=[...validateTaxonomy(metadata),...validateMdxSource(parsed.body)];
 // Phase 1 has no embedded HTML/components, even approved website components.
 if(/<\/?[A-Za-z!]|<\>|!\[[^\]]*\]\(\s*(?:javascript|data):/i.test(parsed.body))errors.push('HTML/MDX embeds forbidden in finalized Markdown');
 if(errors.length)throw Error(errors.join('; '));
 const destination=`content/zh-CN/${proposal.domain}/${metadata.slug}.md`;
 const output=`---\n${JSON.stringify(metadata,null,2)}\n---\n${parsed.body}`;
 const exactResume=resume?.destination===destination&&resume.outputHash===digest(output)&&fs.existsSync(path.join(repo,destination))&&digest(fs.readFileSync(path.join(repo,destination)))===resume.outputHash;
 const existing=discoverAndParseContent(path.join(repo,'content')).filter(record=>!exactResume||record.sourcePath!==destination.slice(8));
 if((fs.existsSync(path.join(repo,destination))&&!exactResume)||existing.some(r=>r.frontmatter.id===metadata.id||r.frontmatter.canonical_id===metadata.canonical_id||(r.domain===proposal.domain&&r.frontmatter.slug===metadata.slug&&r.frontmatter.language==='zh-CN')))throw Error('canonical ID / slug / path collision');
 const record={frontmatter:metadata,body:parsed.body,sourcePath:destination.slice(8),domain:proposal.domain as 'library'|'stories'};
 const report=validateContentRecords([...existing,record]);if(report.errors.length)throw Error(report.errors.join('; '));

 const url='https://paulzhang.org'+contentPath({domain:record.domain,slug:metadata.slug,language:'zh-CN'});
 const version={uploadHash:digest(source),bodyHash:digest(parsed.body),metadataHash:digest(JSON.stringify(metadata)),outputHash:digest(output),destination,url,visibility:metadata.visibility,access:metadata.access_level,canonicalId:metadata.canonical_id,locale:'zh-CN',intent:'publish'};
 return {metadata,body:parsed.body,output,destination,url,version,versionHash:digest(JSON.stringify(version)),warnings:report.warnings.filter(w=>w.includes(metadata.canonical_id))};
}
