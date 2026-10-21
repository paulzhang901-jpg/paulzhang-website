"use client";

import { useState } from "react";
import {approvedYoutubeVideos, type ApprovedYoutubeVideoId} from "@/config/approved-youtube-videos";

// ADR-0038: no arbitrary video ID or origin input; no third-party request before activation.
export function ApprovedYoutubePlayer({videoId = "0J44f6acTeQ"}: {videoId?: ApprovedYoutubeVideoId}) {
  const video = approvedYoutubeVideos[videoId];
  const zh = video?.locale === "zh-CN";
  const [enabled, setEnabled] = useState(false);
  if (!video) return null;
  return <div>
    {enabled ? <iframe
      src={"https://www.youtube-nocookie.com/embed/" + videoId}
      title={video.title + " — Paul Zhang"}
      className="aspect-video w-full rounded-md border-0 bg-black"
      allow="encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
    /> : <div className="aspect-video flex flex-col items-center justify-center gap-4 rounded-md bg-muted p-6 text-center">
      <p>{zh ? "本视频由 YouTube 提供。加载后将连接 YouTube，并适用其隐私政策。" : "This video is provided by YouTube. Loading it connects to YouTube and is subject to its privacy policy."}</p>
      <button type="button" onClick={() => setEnabled(true)}
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-3 text-white">
        {zh ? "加载 YouTube 视频：" : "Load YouTube video: "}{video.title}
      </button>
    </div>}
    <p className="mt-3 text-sm text-muted-foreground">{zh ? "本页未提供经审核的字幕文件。YouTube 播放器中的字幕以平台实际提供为准。" : "No reviewed subtitle file is provided on this page. Caption availability is determined by YouTube."}</p>
    <a href={"https://www.youtube.com/watch?v=" + videoId}
      className="inline-flex min-h-11 items-center text-primary underline">{zh ? "在 YouTube 上观看" : "Watch on YouTube"}</a>
  </div>;
}
