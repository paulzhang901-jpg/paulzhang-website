import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { validate, read } from './validate.mjs';

test('registries and schemas are parseable and internally consistent', () => {
  assert.doesNotThrow(() => validate());
});

test('public publication statuses do not include draft or review', () => {
  const schema = read('schema/content.schema.json');
  assert.deepEqual(schema.properties.status.enum, ['draft','review','scheduled','published','archived']);
});

test('architecture constitution links every major architecture document', () => {
  const root = path.resolve(process.cwd());
  const architecture = fs.readFileSync(path.join(root, 'docs/architecture/ARCHITECTURE.md'), 'utf8');
  for (const name of ['ROUTE_SCHEMA.md','CONTENT_MODEL.md','TAXONOMY.md','USER_STATE_MACHINE.md','EVENT_SCHEMA.md','PRIVACY_MODEL.md','AI_BOUNDARIES.md','INTERNATIONALIZATION.md','SEARCH_ARCHITECTURE.md','RELEASE_BOUNDARIES.md']) {
    assert.match(architecture, new RegExp(name.replace('.', '\\.')));
  }
});

test('all ten accepted ADRs exist', () => {
  const adrDir = path.resolve('docs/adr');
  for (let number = 1; number <= 10; number += 1) {
    const prefix = String(number).padStart(4, '0');
    const file = fs.readdirSync(adrDir).find((name) => name.startsWith(`${prefix}-`));
    assert.ok(file, `missing ADR-${prefix}`);
    assert.match(fs.readFileSync(path.join(adrDir, file), 'utf8'), /Status: Accepted/);
  }
});

test('relative Markdown links resolve to repository files or directories', () => {
  const root = path.resolve(process.cwd());
  const files = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.name.endsWith('.md')) files.push(target);
    }
  };
  for (const directory of ['docs']) walk(path.join(root, directory));
  files.push(path.join(root, 'AGENTS.md'), path.join(root, '.github/pull_request_template.md'));
  for (const file of files) {
    const markdown = fs.readFileSync(file, 'utf8');
    for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const link = match[1].split('#')[0];
      if (!link || /^(?:https?:|mailto:)/.test(link)) continue;
      assert.ok(fs.existsSync(path.resolve(path.dirname(file), link)), `${path.relative(root, file)} has broken link ${link}`);
    }
  }
});
