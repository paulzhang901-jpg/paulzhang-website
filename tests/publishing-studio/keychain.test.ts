import {test} from 'node:test';import assert from 'node:assert/strict';
import {resolveCodexBinary} from '../../tools/publishing-studio/native-auth';
test('Codex resolves installed app binary when Finder PATH has no codex',async()=>{
 const binary=await resolveCodexBinary();assert.ok(binary.endsWith('/codex')||binary==='codex');assert.notEqual(binary,'');
});
