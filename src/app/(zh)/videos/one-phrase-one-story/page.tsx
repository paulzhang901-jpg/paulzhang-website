import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Section, SectionHeading } from "@/components/layout/section";
import { seriesEpisodes, seriesPath, seriesTitle } from "@/lib/content/one-phrase-one-story";

export const metadata = {title: seriesTitle, alternates: {canonical: seriesPath}};

export default function SeriesPage() {
  return <Section><Container>
    <Link href="/videos" className="text-primary underline">返回视频讲堂</Link>
    <SectionHeading title={seriesTitle}>
      <p lang="en">One Phrase, One Story</p>
      <p>一句英语，一个精彩故事。通过英语习语，探索经典故事、历史文化与人生智慧，在故事中学习真正实用的英语。</p>
      <p lang="en">One English phrase. One fascinating story. Explore the language, history, and wisdom behind familiar English expressions.</p>
    </SectionHeading>
    <h2 className="mb-4 text-xl font-semibold">分集</h2>
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {seriesEpisodes.map(episode => <li key={episode.episode}>
        <Link href={seriesPath + "/" + episode.episode} className="block overflow-hidden rounded-xl border">
          <Image src={episode.thumbnail} alt="" width={960} height={540} className="h-auto w-full" />
          <div className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">第 {episode.episode} 集 · 人性与选择</p>
            <h3 className="font-semibold text-primary">{episode.title_zh}</h3>
            <p lang="en">{episode.title_en}</p>
          </div>
        </Link>
      </li>)}
    </ul>
  </Container></Section>;
}
