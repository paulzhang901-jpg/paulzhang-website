import {readFile,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {validateSubtitles} from '../../src/lib/media-publishing/subtitles.mjs';
import {safeSubtitleFilterPath,validateRenderedVideo} from '../../src/lib/media-publishing/video-validation.mjs';
// Local-only. No render unless explicitly invoked with --render and verified alignment evidence.
const [configPath,flag]=process.argv.slice(2);
if(!configPath) throw new Error('Usage: node render-video.mjs <approved-local-job.json> [--render]');
const c=JSON.parse(await readFile(configPath,'utf8'));
for(const key of ['audio','background','subtitles','output','title','author','alignmentEvidence']) if(!c[key]) throw new Error('Missing approved video job field: '+key);
if(c.mock || c.production || !c.approvedBackground || !c.alignmentEvidence.verified || !Number.isFinite(c.alignmentEvidence.measuredDurationSeconds)) throw new Error('Refusing production/mock/unaligned video');
for(const key of ['audio','background','subtitles']) await stat(c[key]);
const ext=path.extname(c.subtitles).toLowerCase();
const subtitleText=await readFile(c.subtitles,'utf8');
validateSubtitles(subtitleText,{format:ext==='.srt'?'srt':ext==='.vtt'?'vtt':'unknown',durationSeconds:c.alignmentEvidence.measuredDurationSeconds,expectedText:c.alignmentEvidence.approvedTranscript});
if(path.extname(c.audio).toLowerCase()!=='.mp3'||path.extname(c.output).toLowerCase()!=='.mp4') throw new Error('MP3 input and MP4 output required');
const ffprobe=spawnSync('ffprobe',['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',c.audio],{encoding:'utf8'});
if(ffprobe.status!==0) throw new Error('ffprobe unavailable or invalid MP3');
const duration=Number(ffprobe.stdout.trim());
if(!Number.isFinite(duration)||Math.abs(duration-c.alignmentEvidence.measuredDurationSeconds)>0.1) throw new Error('Narration duration mismatch');
// Title/author and closing site identification are provided via preapproved title/closing cards.
for(const key of ['titleCard','closingCard']) {if(!c[key]) throw new Error('Approved '+key+' required');await stat(c[key]);}
const subPath=safeSubtitleFilterPath(c.subtitles);
const filter=`[0:v]scale=1920:1080,format=yuv420p,subtitles=${subPath}[base];[2:v]scale=1920:1080,format=yuva420p[title];[3:v]scale=1920:1080,format=yuva420p[closing];[base][title]overlay=enable='between(t,0,3)'[intro];[intro][closing]overlay=enable='gte(t,${Math.max(0,duration-3)})'[v]`;
const args=['-hide_banner','-y','-loop','1','-framerate','30','-i',c.background,'-i',c.audio,'-loop','1','-i',c.titleCard,'-loop','1','-i',c.closingCard,'-filter_complex',filter,'-map','[v]','-map','1:a:0','-c:v','libx264','-r','30','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-t',String(duration),'-movflags','+faststart',c.output];
if(flag!=='--render') {console.log('DRY RUN ONLY. Rendering not performed.');console.log(JSON.stringify({title:c.title,author:c.author,website:'paulzhang.org',duration,output:c.output,ffmpegArgs:args}));process.exit(0);}
// Production generation is separately prohibited in Phase 6B. Test-only jobs may render locally.
const result=spawnSync('ffmpeg',args,{stdio:'inherit'});
if(result.status!==0) throw new Error('FFmpeg rendering failed');
await validateRenderedVideo(c.output,duration);
