import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Section, SectionHeading } from "@/components/layout/section";
import { seriesEpisodes, seriesPath, seriesTitle } from "@/lib/content/one-phrase-one-story";

export async function generateMetadata({params}: {params: Promise<{episode: string}>}) {
  const {episode: number} = await params;
  const episode = seriesEpisodes.find(item => item.episode === number);
  if (!episode) return {};
  return {title: episode.title_zh + " · " + seriesTitle, alternates: {canonical: seriesPath + "/" + number}};
}
export function generateStaticParams() {
  return seriesEpisodes.map(({episode}) => ({episode}));
}

export default async function EpisodePage({params}: {params: Promise<{episode: string}>}) {
  const {episode: number} = await params;
  const episode = seriesEpisodes.find(item => item.episode === number);
  if (!episode) notFound();
  return <Section><Container>
    <Link href={seriesPath} className="text-primary underline">返回{seriesTitle}</Link>
    <p className="mt-4 text-sm text-muted-foreground">第 {episode.episode} 集 · 人性与选择</p>
    <SectionHeading title={episode.title_zh}>
      <p lang="en">{episode.title_en}</p>
      <p>{episode.introduction}</p>
    </SectionHeading>
    <video controls playsInline preload="metadata" poster={episode.thumbnail} aria-label={episode.title_zh}
      className="aspect-video w-full max-w-4xl rounded-xl bg-black" src={episode.playback_url}>
      字幕已嵌入视频。也可下载下方字幕文件。
    </video>
    <p className="mt-3 text-sm text-muted-foreground">故事与教学旁白使用 Paul Zhang 授权的 AI 声音。欢迎词为真人原声。</p>
    <a href={episode.subtitles_url} download className="inline-flex min-h-11 items-center text-primary underline">下载中英文字幕</a>
    <div className="mt-6 max-w-prose space-y-4">
      <h2 className="text-xl font-semibold">英语表达</h2>
      <p><strong lang="en">{episode.title_en}</strong> · {episode.meaning}</p>
      <ol className="list-decimal space-y-3 pl-6">
        {episode.examples.map(example => <li key={example.en}><p lang="en">{example.en}</p><p>{example.zh}</p></li>)}
      </ol>
      <h2 className="text-xl font-semibold">故事背景</h2>
      <p>{episode.background}</p>
      {episode.youtube_url && <a href={episode.youtube_url} className="text-primary underline">在 YouTube 观看</a>}
    </div>
  </Container></Section>;
}
