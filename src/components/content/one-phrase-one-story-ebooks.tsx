import {onePhraseOneStory as book} from "@/lib/content/one-phrase-one-story-ebooks";
import type {ContentLanguage} from "@/types/content";

export function OnePhraseOneStoryEbooks({locale}: {locale: ContentLanguage}) {
  const chinese = locale === "zh-CN";
  return <section aria-labelledby="one-phrase-one-story-title" id="one-phrase-one-story" className="mt-16 border-t pt-12">
    <header className="max-w-3xl">
      <h3 id="one-phrase-one-story-title" className="font-serif text-3xl leading-tight sm:text-4xl">{chinese ? book.zhTitle : book.enTitle}</h3>
      <p className="mt-3 font-serif text-2xl leading-snug" lang={chinese ? "en" : "zh-CN"}>{chinese ? book.enTitle : book.zhTitle}</p>
      <p className="mt-4 leading-7 text-muted-foreground">{chinese
        ? "从100个英语表达出发，阅读它们背后的圣经故事，探索文化背景、现代用法与人生智慧。中英文各100章，可独立阅读。"
        : "Explore 100 English expressions through biblical stories, cultural background, modern usage, and practical life lessons. Each language edition contains all 100 chapters."}</p>
      <p className="mt-3 text-sm font-medium text-primary">{chinese ? "作者审阅版 · 免费 PDF" : "Author review edition · Free PDF"}</p>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">{chinese ? "本版仍在校订，文字与注释可能调整。" : "This edition is under editorial review; text and notes may be revised."}</p>
    </header>
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {book.editions.map(edition => <article key={edition.language} className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border bg-surface">
        <div className="flex justify-center bg-muted/50 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={book.cover} alt={chinese ? `${book.zhTitle}封面` : `Cover of ${book.enTitle}`} width={400} height={600} className="h-64 w-auto max-w-full object-contain shadow-sm sm:h-72" loading="lazy" />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h4 className="font-serif text-2xl leading-snug">{chinese ? edition.label : edition.enLabel}</h4>
          <p className="mt-3 text-sm">{book.author}</p>
          <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{chinese ? `100章 · ${edition.pages}页 · 作者审阅版` : `100 chapters · ${edition.pages} pages · Author review edition`}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={edition.pdf} className="inline-flex min-h-11 items-center justify-center rounded-md border px-5 py-2 font-medium text-primary hover:bg-muted" aria-label={chinese ? `在线阅读${edition.label} PDF` : `Read ${edition.enLabel} PDF online`}>{chinese ? "在线阅读" : "Read online"}</a>
            <a href={edition.pdf} download className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2 font-medium text-primary-foreground hover:opacity-90" aria-label={chinese ? `免费下载${edition.label} PDF` : `Download ${edition.enLabel} PDF free`}>{chinese ? "免费下载 PDF" : "Download PDF"}</a>
          </div>
        </div>
      </article>)}
    </div>
  </section>;
}
