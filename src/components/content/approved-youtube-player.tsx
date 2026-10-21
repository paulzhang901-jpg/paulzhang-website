"use client";

import { useState } from "react";

// ADR-0038: no arbitrary video ID or origin input; no third-party request before activation.
export function ApprovedYoutubePlayer() {
  const [enabled, setEnabled] = useState(false);
  return <div>
    {enabled ? <iframe
      src="https://www.youtube-nocookie.com/embed/0J44f6acTeQ"
      title="仍旧不悔改 — Paul Zhang"
      className="aspect-video w-full rounded-md border-0 bg-black"
      allow="encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
    /> : <div className="aspect-video flex flex-col items-center justify-center gap-4 rounded-md bg-muted p-6 text-center">
      <p>本视频由 YouTube 提供。加载后将连接 YouTube，并适用其隐私政策。</p>
      <button type="button" onClick={() => setEnabled(true)}
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 py-3 text-white">
        加载 YouTube 视频：仍旧不悔改
      </button>
    </div>}
    <p className="mt-3 text-sm text-muted-foreground">本页未提供经审核的字幕文件。YouTube 播放器中的字幕以平台实际提供为准。</p>
    <a href="https://www.youtube.com/watch?v=0J44f6acTeQ"
      className="inline-flex min-h-11 items-center text-primary underline">在 YouTube 上观看</a>
  </div>;
}
