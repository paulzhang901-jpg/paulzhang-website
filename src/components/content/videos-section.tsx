import { ApprovedYoutubePlayer } from "./approved-youtube-player";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import type { ContentLanguage, ScriptureReference } from "@/types/content";

// Presentation-only input resolved from canonical content and reviewed media.
// This is not a second content catalog or an authorization mechanism.
export type VideoPresentation = {
  canonicalId: string;
  locale: ContentLanguage;
  title: string;
  alternateTitle?: string;
  scriptureRefs?: readonly ScriptureReference[];
  publishedAt?: string;
  provider?: "youtube";
  videoId?: "0J44f6acTeQ";
  mp4?: string;
  poster?: string;
  captions?: string;
  article: string;
  audio?: string;
  detail?: string;
  srt?: string;
};

function safeUrl(value: string, media = false) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      (!media || !/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/i.test(url.hostname));
  } catch { return false; }
}

export function VideosSection({ locale, items = [], showDetails = true }: {
  locale: ContentLanguage; items?: readonly VideoPresentation[]; showDetails?: boolean;
}) {
  const zh = locale === "zh-CN";
  const visible = items.filter(item => item.locale === locale &&
    (item.provider === "youtube" ? item.canonicalId === "sermon-revelation-9-20-21" && item.locale === "zh-CN" && item.videoId === "0J44f6acTeQ" : [item.mp4, item.poster, item.captions].every(url => typeof url === "string" && safeUrl(url, true))) &&
    safeUrl(item.article) && (!item.audio || safeUrl(item.audio, true)));
  return <Section className="border-t bg-muted/30"><Container>
    <h2 id="videos" className="font-serif text-3xl">{zh ? "视频讲堂" : "Videos"}</h2>
    {visible.length ? <div className="mt-8 grid gap-8 lg:grid-cols-2">
      {visible.map(item => <article key={item.canonicalId} className="min-w-0 rounded-lg border bg-surface p-5">
        <h3 className="mb-4 font-serif text-2xl">{item.title}</h3>
        {item.alternateTitle ? <p className="mb-3 text-muted-foreground" lang={zh ? "en" : "zh"}>{item.alternateTitle}</p> : null}
        {item.scriptureRefs?.length ? <p className="mb-3 text-sm text-muted-foreground">{zh ? "经文：" : "Scripture: "}{item.scriptureRefs.map(reference => {
          const start = reference.book + " " + reference.chapterStart + (reference.verseStart ? ":" + reference.verseStart : "");
          const end = reference.chapterEnd ? reference.chapterEnd === reference.chapterStart && reference.verseEnd ? reference.verseEnd : reference.chapterEnd + (reference.verseEnd ? ":" + reference.verseEnd : "") : undefined;
          return end ? start + "–" + end : start;
        }).join("; ")}</p> : null}
        {item.publishedAt ? <p className="mb-4 text-sm text-muted-foreground">{zh ? "视频发布：" : "Video published: "}<time dateTime={item.publishedAt}>{new Intl.DateTimeFormat(locale, {dateStyle: "medium", timeZone: "UTC"}).format(new Date(item.publishedAt))}</time></p> : null}
        {item.provider === "youtube" ? <ApprovedYoutubePlayer /> : <video controls playsInline crossOrigin="anonymous" preload="none" poster={item.poster}
          aria-label={item.title} className="aspect-video w-full rounded-md bg-black">
          <source src={item.mp4} type="video/mp4" />
          <track kind="captions" src={item.captions} srcLang={zh ? "zh" : "en"}
            label={zh ? "中文字幕" : "English captions"} />
          <a href={item.mp4}>{zh ? "下载视频" : "Download video"}</a>
        </video>}
        {item.provider === "youtube" ? null : <p className="mt-3 text-sm text-muted-foreground">{zh ? "AI 合成旁白，非作者本人录音。" : "AI-generated narration; not a recording of the author."}</p>}
        <nav aria-label={zh ? `与《${item.title}》相关的资源` : `Resources for ${item.title}`}
          className="mt-4 flex flex-wrap gap-5">
          {showDetails && item.detail ? <a href={item.detail} className="inline-flex min-h-11 items-center text-primary underline">{zh ? "视频详情" : "Video details"}</a> : null}
          {item.srt ? <a href={item.srt} download className="inline-flex min-h-11 items-center text-primary underline">{zh ? "下载字幕" : "Download subtitles"}</a> : null}
          <a href={item.article} className="inline-flex min-h-11 items-center text-primary underline">{zh ? "阅读原文" : "Read article"}</a>
          {item.audio ? <a href={item.audio} className="inline-flex min-h-11 items-center text-primary underline">{zh ? "收听音频" : "Listen to audio"}</a> : null}
          {item.mp4 ? <a href={item.mp4} className="inline-flex min-h-11 items-center text-primary underline">{zh ? "打开视频文件" : "Open video file"}</a> : null}
        </nav>
      </article>)}
    </div> : <p className="mt-5 leading-7 text-muted-foreground">{zh ? "目前暂无已发布的视频。" : "No published videos are available yet."}</p>}
  </Container></Section>;
}
