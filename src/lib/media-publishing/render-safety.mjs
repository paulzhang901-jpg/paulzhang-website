import os from 'node:os';
import path from 'node:path';
import {lstat, mkdir, realpath, readFile, link, mkdtemp, rm} from 'node:fs/promises';
import {sha256, validateManifest, verifyMockWav} from './core.mjs';

// A fixed OS temporary subtree, never an arbitrary caller-selected directory.
export const TEST_VIDEO_OUTPUT_ROOT = path.join(os.tmpdir(), 'paul-media-render-output');

export async function validateTestOutput(output) {
  if (typeof output !== 'string' || !/^[a-zA-Z0-9_-]+\.mp4$/.test(output)) throw new Error('Unsafe output filename: relative MP4 basename required');
  await mkdir(TEST_VIDEO_OUTPUT_ROOT, {recursive:true});
  if ((await lstat(TEST_VIDEO_OUTPUT_ROOT)).isSymbolicLink()) throw new Error('Output root is not a trusted directory');
  const canonicalRoot=await realpath(TEST_VIDEO_OUTPUT_ROOT);
  const target=path.join(canonicalRoot,output);
  try {await lstat(target);throw new Error('Output already exists: overwrite forbidden');} catch(e) {if(e.code!=='ENOENT') throw e;}
  return target;
}

export async function withReservedTestOutput(output, render) {
  const target=await validateTestOutput(output);
  const staging=await mkdtemp(path.join(TEST_VIDEO_OUTPUT_ROOT,'.staging-'));
  const staged=path.join(staging,'video.mp4');
  try {
    await render(staged);
    // Hard-link creation is exclusive: an existing destination is never overwritten.
    await validateTestOutput(output);
    await link(staged,target);
    return target;
  } finally {await rm(staging,{recursive:true,force:true});}
}

export async function validateTestProvenance(job) {
  // No signed approval/production authorization exists in Phase 6B.
  if(job.production || job.testOnly!==true || job.mock!==true) throw new Error('Production provenance is not authorized in Phase 6B');
  if(!job.audioManifest || !job.audioSha256 || !/^[a-f0-9]{64}$/.test(job.audioSha256)) throw new Error('Missing test media provenance');
  const manifest=validateManifest(JSON.parse(await readFile(job.audioManifest,'utf8')));
  if(manifest.generation_status!=='mock' || manifest.audio_provider!=='mock' || manifest.audio_format!=='wav' || !manifest.mock_warning) throw new Error('Untrusted or forged mock provenance');
  if(!manifest.canonical_id || !manifest.voice || !manifest.audio_model || !manifest.voice_config_hash || !manifest.article_content_hash) throw new Error('Missing source identity');
  if(verifyMockWav(await readFile(manifest.audio_file_path))!==manifest.audio_sha256) throw new Error('Mock source hash mismatch');
  if(sha256(await readFile(job.audio))!==job.audioSha256) throw new Error('Test MP3 hash mismatch');
  return manifest;
}
