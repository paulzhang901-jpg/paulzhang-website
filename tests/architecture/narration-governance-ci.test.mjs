import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('narration governance regression suite participates in blocking CI validation',()=>{
  const workflow=readFileSync('.github/workflows/architecture-validation.yml','utf8');
  const application=workflow.split('\n  application:\n')[1]?.split('\n  content:\n')[0];
  assert(application,'required application job exists');
  assert.match(application,/^      - run: pnpm run test:narration-governance$/m);
  assert.doesNotMatch(application,/continue-on-error:|\n\s+if:/);
  const validation=workflow.split('\n  validate:\n')[1]?.split('\n  production-deploy:\n')[0];
  assert.match(validation,/needs: \[architecture, application, content, security\]/);
  assert.match(validation,/job\.result !== "success"/);
  assert.match(validation,/process\.exit\(1\)/);
});
