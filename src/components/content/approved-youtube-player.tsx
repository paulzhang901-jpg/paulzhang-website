"use client";

import { useState } from "react";

// ADR-0038/0040/0042: fixed bindings only; no third-party request before activation.
const bindings = {
  "j4iVhPwUvK8": {locale:"zh-CN", title:"大卫与歌利亚：信心胜过恐惧", reviewedCaptions:true},
  "nlt5tOE2AcE": {locale:"en-US", title:"David and Goliath: Faith Over Fear", reviewedCaptions:true},
  "0J44f6acTeQ": {locale:"zh-CN", title:"仍旧不悔改"},
  "KQ6jdIFjB8c": {locale:"zh-CN", title:"不再耽延的日子"},
  "q8q67bsI3t0": {locale:"en-US", title:"The Day of No More Delay"},
} as const;
export function ApprovedYoutubePlayer({videoId,locale}:{videoId:keyof typeof bindings;locale:"zh-CN"|"en-US"}) {
  const [enabled, setEnabled] = useState(false);
  const binding=bindings[videoId];
  if(!binding || binding.locale!==locale) return null;
  const zh=locale==="zh-CN";
  return <div>
    {enabled ? <iframe
      src={"https://www.youtube-nocookie.com/embed/"+videoId}
      title={binding.title+" — Paul Zhang"}
      className="aspect-video w-full rounded-md border-0 bg-black"
      allow="encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
    /> : <div className="aspect-video flex flex-col items-center justify-center gap-4 rounded-md bg-muted p-6 text-center">
      <p>{zh ? "本视频由 YouTube 提供。加载后将连接 YouTube，并适用其隐私政策。" : "This video is provided by YouTube. Loading it connects to YouTube and its privacy policy applies."}</p>
      <button type="button" onClick={() => setEnabled(true)}
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-3 text-white">
        {zh ? "加载 YouTube 视频：" : "Load YouTube video: "}{binding.title}
      </button>
    </div>}
    <p className="mt-3 text-sm text-muted-foreground">{"reviewedCaptions" in binding ? (zh ? "已上传中文字幕；可在 YouTube 播放器的字幕设置中开启。" : "English captions have been uploaded; enable them in the YouTube player settings.") : (zh ? "本页未提供经审核的字幕文件。YouTube 播放器中的字幕以平台实际提供为准。" : "No reviewed subtitle file is supplied on this page. Captions depend on what YouTube actually provides.")}</p>
    <a href={"https://www.youtube.com/watch?v="+videoId}
      className="inline-flex min-h-11 items-center text-primary underline">{zh ? "在 YouTube 上观看" : "Watch on YouTube"}</a>
  </div>;
}
