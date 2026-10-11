import {spawnSync} from 'node:child_process';
import {stat} from 'node:fs/promises';
import path from 'node:path';

// Restrict paths embedded in FFmpeg filter expressions to a conservative ASCII subset.
// Shell-safe argv is not enough: filter_complex has its own parser.
export function safeSubtitleFilterPath(file) {
  const absolute=path.resolve(file);
  if (!/^[A-Za-z0-9_./-]+$/.test(absolute) || !/\.(srt|vtt)$/.test(absolute)) throw new Error('Unsafe subtitle filter path');
  return absolute;
}

export function inspectProbeData(data,{durationSeconds}={}) {
  const streams=data?.streams;
  const format=data?.format;
  if (!Array.isArray(streams) || !format || !Number.isFinite(Number(format.duration)) || Number(format.duration)<=0 || !Number.isFinite(Number(format.size)) || Number(format.size)<1024) throw new Error('Invalid or incomplete media container');
  const video=streams.filter(s=>s.codec_type==='video');
  const audio=streams.filter(s=>s.codec_type==='audio');
  if (video.length!==1 || audio.length!==1 || video[0].codec_name!=='h264' || audio[0].codec_name!=='aac' || video[0].width!==1920 || video[0].height!==1080 || video[0].avg_frame_rate!=='30/1') throw new Error('Unexpected media streams or encoding');
  if (Number.isFinite(durationSeconds) && Math.abs(Number(format.duration)-durationSeconds)>0.3) throw new Error('Output duration mismatch');
  return true;
}

export async function validateRenderedVideo(file,durationSeconds,{spawn=spawnSync}={}) {
  if(path.extname(file).toLowerCase()!=='.mp4' || (await stat(file)).size<1024) throw new Error('Missing or incomplete MP4');
  const result=spawn('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file],{encoding:'utf8'});
  if(result.error || result.status!==0) throw new Error('ffprobe unavailable or output invalid');
  let data;
  try {data=JSON.parse(result.stdout);} catch {throw new Error('Invalid ffprobe JSON');}
  inspectProbeData(data,{durationSeconds});
  const decode=spawn('ffmpeg',['-v','error','-xerror','-i',file,'-f','null','-'],{encoding:'utf8'});
  if(decode.error || decode.status!==0) throw new Error('Output decoding failed or ffmpeg unavailable');
  return true;
}
