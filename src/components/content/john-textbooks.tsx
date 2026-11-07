import books from "@/lib/content/john-textbooks.json";

/** Catalogue only. NIV permission for public PDF distribution remains pending.
 * Do not place these PDFs in public/ or add links before the documented release review.
 */
export function JohnTextbooks() {
  return <section aria-labelledby="john-textbooks-title" className="mt-16 border-t pt-12">
    <header className="max-w-3xl">
      <h3 id="john-textbooks-title" lang="zh-CN" className="font-serif text-3xl leading-tight sm:text-4xl">跟着约翰福音学英语</h3>
      <p lang="en" className="mt-3 font-serif text-2xl leading-snug">Learning English Through the Gospel of John</p>
    </header>
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <div lang="zh-CN" className="space-y-4 leading-7 text-muted-foreground">
        <h4 className="font-semibold text-foreground">圣经学习 · 英语提升 · 生命成长</h4>
        <p>《跟着约翰福音学英语》是一套以圣经为基础的英语学习教材，由张崇助牧师编写。</p>
        <p>全套教材涵盖《约翰福音》21章、879节经文，分为基础级、中级和进阶级三个阶段。</p>
        <p>每课结合圣经阅读、英语词汇、语法分析、句子结构、阅读理解、口语练习及生命应用，帮助学习者循序渐进地提高英语能力，同时深入认识圣经真理。</p>
        <p className="font-semibold text-foreground">建议学习方法：</p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>阅读经文，理解基本内容。</li><li>学习词汇、语法和句子结构。</li><li>大声朗读，练习英语表达。</li><li>完成练习，巩固所学知识。</li><li>默想经文，将圣经真理应用于生活。</li>
        </ol>
        <p>我们的目标是：<strong className="text-foreground">以英语为工具，以圣经为教材，以真理为根基，以生命成长为方向。</strong></p>
      </div>
      <div lang="en" className="space-y-4 leading-7 text-muted-foreground">
        <h4 className="font-semibold text-foreground">Bible Study · English Learning · Spiritual Growth</h4>
        <p><em>Learning English Through the Gospel of John</em> is a Bible-based English learning series developed by Rev. Paul Zhang.</p>
        <p>Covering all 21 chapters and 879 verses of the Gospel of John, the series is organized into three progressive levels: Beginner, Intermediate, and Advanced.</p>
        <p>Each lesson integrates Scripture reading, vocabulary, grammar, sentence structure, reading comprehension, speaking practice, and practical application.</p>
        <p>The series is designed to help learners strengthen their English skills while developing a deeper understanding of biblical truth.</p>
        <p className="font-semibold text-foreground">How to Study:</p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Read the Scripture passage for understanding.</li><li>Study key vocabulary, grammar, and sentence patterns.</li><li>Read aloud and practice speaking.</li><li>Complete the exercises to reinforce learning.</li><li>Reflect on the passage and apply biblical truth to daily life.</li>
        </ol>
        <p><strong className="text-foreground">Our Vision:</strong> English as a tool, Scripture as our textbook, truth as our foundation, and spiritual growth as our goal.</p>
      </div>
    </div>
    <div className="mt-8 rounded-lg border bg-surface p-6 text-sm leading-7 text-muted-foreground sm:p-8">
      <p lang="zh-CN" className="font-semibold text-foreground">本系列教材只做个人学习之用，不得用于商业为目的的活动。</p>
      <p lang="en" className="mt-2">For personal study only. This series must not be used for commercial purposes.</p>
      <p lang="zh-CN" className="mt-3">PDF 下载暂未开放：NIV 经文公开发行授权尚待确认。</p>
      <p lang="en" className="mt-2">PDF downloads are not yet available. Permission for public distribution of the NIV Scripture text is pending.</p>
    </div>
    {(["zh-CN", "en-US"] as const).map(language => <section key={language} aria-labelledby={`john-${language}-title`} className="mt-10">
      <h4 id={`john-${language}-title`} className="mb-6 font-serif text-2xl">{language === "zh-CN" ? "中文版｜Chinese Edition" : "英文版｜English Edition"}</h4>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {books.filter(book => book.language === language).map(book => <article key={book.id} data-john-book={book.id} lang={language} className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border bg-surface">
          <div className="flex justify-center bg-muted/50 p-6">
            {/* Existing artwork; static export must preserve the full cover. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={book.cover} alt={language === "zh-CN" ? `${book.title}封面` : `Cover of ${book.title}`} width={634} height={900} loading="lazy" className="h-64 w-auto max-w-full object-contain shadow-sm sm:h-72" />
          </div>
          <div className="flex flex-1 flex-col p-6">
            <p className="text-sm font-semibold text-primary">{book.level} · {language === "zh-CN" ? `约翰福音${book.chapters}章` : `John ${book.chapters}`}</p>
            <h5 className="mt-3 font-serif text-2xl leading-snug">{book.title}</h5>
            <p className="mt-4 text-sm">{language === "zh-CN" ? "张崇助牧师" : "Rev. Paul Zhang"}</p>
            <p className="mt-3 text-sm text-muted-foreground">PDF · {book.pages.toLocaleString("en-US")} {language === "zh-CN" ? "页" : "pages"} · {(book.bytes / 1048576).toFixed(1)} MiB</p>
            <p className="mt-4 flex-1 leading-7 text-muted-foreground">{language === "zh-CN" ? `通过约翰福音${book.chapters}章的经文阅读、词汇、语法、口语练习和生命应用，循序学习${book.level}英语。` : `Develop ${book.level.toLowerCase()} English skills through Scripture reading, vocabulary, grammar, speaking practice, and practical application in John ${book.chapters}.`}</p>
            <button type="button" disabled aria-describedby="john-download-status" className="mt-6 inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-md border bg-muted px-5 py-2 font-medium text-muted-foreground">{language === "zh-CN" ? "PDF 下载 · 待授权" : "PDF download · Permission pending"}</button>
          </div>
        </article>)}
      </div>
    </section>)}
    <p id="john-download-status" className="mt-6 text-sm leading-7 text-muted-foreground"><span lang="zh-CN">六册 PDF 已完成制作；公开下载将在取得相应用途的授权并完成核验后开放。</span>{" "}<span lang="en">All six PDFs have been produced; public downloads will open after the required permissions and release checks are complete.</span></p>
  </section>;
}
