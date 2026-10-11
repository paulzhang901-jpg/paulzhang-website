function seconds(stamp) {
  const m=/^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/.exec(stamp);
  if(!m) throw new Error('Invalid subtitle timestamp: '+stamp);
  const [,h,min,s,ms]=m.map(Number);
  if(min>59 || s>59) throw new Error('Invalid subtitle time component');
  return h*3600+min*60+s+ms/1000;
}
export function validateSubtitles(content,{format,durationSeconds,expectedText}) {
  if(!Number.isFinite(durationSeconds) || durationSeconds<=0) throw new Error('Measured narration duration required');
  if(!['srt','vtt'].includes(format)) throw new Error('Unsupported subtitle format');
  const normalized=content.replace(/\r\n/g,'\n').trim();
  const body=format==='vtt' ? normalized.replace(/^WEBVTT\n(?:\n)?/,'') : normalized;
  if(format==='vtt' && !normalized.startsWith('WEBVTT\n')) throw new Error('Missing WEBVTT header');
  const cues=body.split(/\n\s*\n/).filter(Boolean);
  let lastEnd=0;
  const texts=[];
  for(let i=0;i<cues.length;i++) {
    const lines=cues[i].split('\n');
    if(format==='srt' && lines.shift()!==String(i+1)) throw new Error('SRT index mismatch');
    const timing=lines.shift();
    const m=/^(\d{2}:\d{2}:\d{2}[,.]\d{3}) --> (\d{2}:\d{2}:\d{2}[,.]\d{3})$/.exec(timing??'');
    if(!m || !lines.length || !lines.join('').trim()) throw new Error('Invalid subtitle cue');
    const start=seconds(m[1]),end=seconds(m[2]);
    if(start<lastEnd || end<=start || end>durationSeconds+0.02) throw new Error('Overlapping, out-of-order or overlong subtitles');
    lastEnd=end;
    texts.push(lines.join(' '));
  }
  if(!cues.length) throw new Error('No subtitle cues');
  if(expectedText && texts.join(' ').replace(/\s+/g,'').normalize('NFC')!==expectedText.replace(/\s+/g,'').normalize('NFC')) throw new Error('Subtitle transcript differs from approved narration');
  return {cueCount:cues.length,lastEndSeconds:lastEnd};
}
