import Image from "next/image";
import Link from "next/link";
import type {Route} from "next";
import type {Locale} from "@/config/i18n";
import {localizedPath} from "@/lib/i18n/routing";
import {socialProfiles} from "@/data/social-links";

const copy={
  "zh-CN":{
    hero:"从小说，到文章，到信仰分享——\n在不同的平台，用不同的方式继续写作与分享。",
    pathwaysTitle:"从这里开始",
    pathways:[
      {n:"01",title:"小说",body:"文学创作 / 牧长客 · 小说世界，以及经过验证的授权小说平台。",action:"探索小说世界",href:"/fiction"},
      {n:"02",title:"新文章",body:"微信公众号通常每周分享约 3–5 篇新内容。",action:"查看公众号",href:"#wechat-official-account"},
      {n:"03",title:"信仰与深度内容",body:"PaulZhang.org 保存和整理信仰、圣经、讲道、成长与长期内容。",action:"进入真理资源库",href:"/library"},
    ],
    fictionTitle:"文学创作｜牧长客 · 小说世界",
    fictionBody:["Paul 以“牧长客”为笔名进行小说创作。paulzhang.org 中的「文学创作」是作者官方作品档案和作品介绍入口。","部分小说作品已经与第三方小说平台签约，因此 paulzhang.org 不作为签约小说全文的第二发布平台。完整签约作品应前往相应的授权阅读平台阅读。"],
    fictionAction:"探索「牧长客 · 小说世界」",
    platform:"授权阅读平台",
    platformBody:"仓库已验证作品阅读指引使用“番茄小说 / Fanqie Novel”与“今日头条”作为授权阅读平台名称，但没有经过验证的作者页或作品页 URL。因此这里只提供平台名称，不创建未经验证的外部链接。",
    wechatTitle:"微信公众号｜持续写作",
    wechatBody:"Paul 通常每周通过微信公众号分享约 3–5 篇新的内容，包括生活观察、成长、写作与其他适合微信公众号发表的文章。读者可以通过微信公众号持续关注最新写作。",
    wechatId:"微信公众号 ID",
    scan:"微信扫描二维码，关注我的账号",
    siteTitle:"PaulZhang.org｜信仰与深度内容",
    siteBody:"有些内容，特别是关于信仰、圣经、讲道、门徒成长、属灵生命，以及较长期保存和整理的文章，更适合直接发表在 Paul 自己的网站。因此 paulzhang.org 不只是个人介绍网站，也是这些内容长期保存、整理和阅读的平台。",
    library:"真理资源库", writing:"写作与讲道", growth:"成长路径",
    videoTitle:"视频与其他媒体",
    videoBody:"除了文字内容之外，Paul 也通过微信视频号及其他已经公开的媒体渠道分享内容。联系方式与媒体入口继续由现有 Contact 页面统一维护。",
    videoVerified:"现有网站已验证微信视频号公开名称与二维码；为避免重复建立媒体目录，本页直接连接现有联系方式与媒体入口。",
    contact:"查看联系方式与媒体入口",
  },
  "en-US":{
    hero:"From fiction to essays to reflections on faith—\nwriting and sharing across different platforms.",
    pathwaysTitle:"Start here",
    pathways:[
      {n:"01",title:"Fiction",body:"Mu Changke Fiction, plus verified guidance for authorized fiction platforms.",action:"Explore Mu Changke Fiction",href:"/en/fiction"},
      {n:"02",title:"New Articles",body:"The WeChat Official Account typically shares about 3–5 new pieces each week.",action:"View WeChat account",href:"#wechat-official-account"},
      {n:"03",title:"Faith & Long-form Content",body:"PaulZhang.org preserves faith, Bible, preaching, growth, and longer-form content.",action:"Enter the Truth Library",href:"/en/library"},
    ],
    fictionTitle:"Fiction & Books | Mu Changke Fiction",
    fictionBody:["Paul writes fiction under the pen name “Mu Changke” (牧长客). The Fiction section on paulzhang.org is the author’s official work archive and introduction point.","Some novels have been contracted with third-party fiction platforms, so paulzhang.org does not serve as a second full-text publication platform for contracted works. Complete contracted works should be read through their authorized reading platforms."],
    fictionAction:"Explore Mu Changke Fiction",
    platform:"Authorized reading platforms",
    platformBody:"The repository-verified reading guidance names Fanqie Novel (番茄小说) and Toutiao (今日头条), but contains no verified author-page or work-page URL. Their names are therefore shown without an unverified external link.",
    wechatTitle:"WeChat Official Account | Ongoing Writing",
    wechatBody:"Paul typically shares about 3–5 new pieces each week through his WeChat Official Account, including observations on life, growth, writing, and other articles suited to WeChat. Follow the account to keep up with new writing.",
    wechatId:"Official Account ID",
    scan:"Scan with WeChat to follow my account.",
    siteTitle:"PaulZhang.org | Faith & Long-form Content",
    siteBody:"Some material—especially content about faith, the Bible, preaching, discipleship, spiritual formation, and writing intended for long-term preservation—is better published directly on Paul’s own website. PaulZhang.org is therefore not only a personal introduction site, but also a place where this content can be preserved, organized, and read over time.",
    library:"Truth Library", writing:"Writing & Preaching", growth:"Growth Pathways",
    videoTitle:"Video & Other Media",
    videoBody:"Beyond written content, Paul also shares through the WeChat Video Channel and other already-public media channels. Contact and media details continue to be maintained on the existing Contact page.",
    videoVerified:"The existing site already contains a verified public WeChat Video Channel name and QR code. To avoid duplicating the media directory, this page points to the established Contact & Media surface.",
    contact:"Contact & Media Channels",
  },
} as const;

const prefix=(locale:Locale)=>locale==="en-US"?"/en":"";
export function PublishingMediaPage({locale}:{locale:Locale}){const c=copy[locale];const social=socialProfiles;return <div className="mt-8 max-w-5xl">
  <p className="max-w-3xl whitespace-pre-line text-xl leading-9 text-muted-foreground">{c.hero}</p>
  <section className="mt-12" aria-labelledby="publishing-pathways"><h2 id="publishing-pathways" className="font-serif text-3xl">{c.pathwaysTitle}</h2><div className="mt-6 grid gap-4 md:grid-cols-3">{c.pathways.map(item=><Link key={item.n} href={item.href as Route} className="group rounded-xl border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm"><span className="text-sm font-semibold text-primary">{item.n}</span><h3 className="mt-3 font-serif text-2xl">{item.title}</h3><p className="mt-3 leading-7 text-muted-foreground">{item.body}</p><span className="mt-5 inline-block font-medium text-primary group-hover:underline">{item.action} →</span></Link>)}</div></section>
  <section className="mt-16 border-t pt-12" aria-labelledby="publishing-fiction"><h2 id="publishing-fiction" className="font-serif text-3xl sm:text-4xl">{c.fictionTitle}</h2>{c.fictionBody.map(p=><p key={p} className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{p}</p>)}<Link href={`${prefix(locale)}/fiction` as Route} className="mt-7 inline-flex min-h-12 items-center rounded-md bg-primary px-5 font-medium text-primary-foreground">{c.fictionAction} →</Link><div className="mt-7 max-w-3xl rounded-lg border bg-muted/40 p-5"><h3 className="font-serif text-2xl">{c.platform}</h3><p className="mt-3 leading-7 text-muted-foreground">{c.platformBody}</p><p className="mt-3 font-medium">番茄小说 / Fanqie Novel · 今日头条 / Toutiao</p></div></section>
  <section id="wechat-official-account" className="mt-16 border-t pt-12" aria-labelledby="publishing-wechat"><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center"><div><h2 id="publishing-wechat" className="font-serif text-3xl sm:text-4xl">{c.wechatTitle}</h2><p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{c.wechatBody}</p><dl className="mt-6 space-y-2"><div><dt className="inline text-muted-foreground">WeChat: </dt><dd className="inline font-semibold">{social.wechatOfficialAccount.displayName}</dd></div><div><dt className="inline text-muted-foreground">{c.wechatId}: </dt><dd className="inline break-all font-semibold">{social.wechatOfficialAccount.accountId}</dd></div></dl></div><figure className="rounded-xl border bg-surface p-5 shadow-[var(--shadow-soft)]"><div className="mx-auto max-w-72 rounded-lg bg-white p-3"><Image src={social.wechatOfficialAccount.qrAsset} alt={locale==="zh-CN"?"PaulZhang1871 微信公众号二维码":"QR code for the PaulZhang1871 WeChat Official Account"} width={645} height={645} sizes="(max-width: 640px) 72vw, 18rem" className="h-auto w-full"/></div><figcaption className="mt-4 text-center text-sm leading-6 text-muted-foreground">{c.scan}</figcaption></figure></div></section>
  <section className="mt-16 border-t pt-12" aria-labelledby="publishing-site"><h2 id="publishing-site" className="font-serif text-3xl sm:text-4xl">{c.siteTitle}</h2><p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{c.siteBody}</p><div className="mt-7 grid gap-4 sm:grid-cols-3"><Link className="rounded-lg border bg-surface p-5 font-medium shadow-[var(--shadow-soft)] hover:bg-muted" href={localizedPath("library",locale)}>{c.library} →</Link><Link className="rounded-lg border bg-surface p-5 font-medium shadow-[var(--shadow-soft)] hover:bg-muted" href={`${prefix(locale)}/about/writing-preaching` as Route}>{c.writing} →</Link><Link className="rounded-lg border bg-surface p-5 font-medium shadow-[var(--shadow-soft)] hover:bg-muted" href={localizedPath("grow",locale)}>{c.growth} →</Link></div></section>
  <section className="mt-16 border-t pt-12" aria-labelledby="publishing-video"><h2 id="publishing-video" className="font-serif text-3xl sm:text-4xl">{c.videoTitle}</h2><p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{c.videoBody}</p><p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{c.videoVerified}</p><Link href={`${prefix(locale)}/about/contact` as Route} className="mt-7 inline-flex min-h-12 items-center rounded-md border px-5 font-medium hover:bg-muted">{c.contact} →</Link></section>
</div>}
