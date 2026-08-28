import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/config/i18n";
import { socialProfiles } from "@/data/social-links";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

const copy = {
  "zh-CN": {
    eyebrow: "关注与联系",
    title: "继续与我同行",
    intro: "无论你在中国大陆或海外，都可以从适合你的渠道继续关注、联系或发出事工邀请。重要账号信息同时以文字呈现，不需要依赖二维码识别。",
    mainland: "中国大陆",
    overseas: "海外",
    official: "微信公众号",
    video: "微信视频号",
    wechat: "微信联系",
    accountId: "公众号 ID",
    channelId: "视频号 ID",
    scan: "使用微信扫描正式二维码",
    visit: "访问",
    invitations: "联系与邀请",
    invitationIntro: "欢迎就以下事项联系。当前不设置公开表单，也不会在未建立隐私与保留机制前收集敏感叙事。",
    invitationTypes: ["邀请讲道", "教会／事工交流", "信仰与生命问题", "门徒训练与成长陪伴", "一般联系"],
    contactNote: "请通过微信联系：",
  },
  "en-US": {
    eyebrow: "Follow & Connect",
    title: "Continue the journey with me",
    intro: "Whether you are in mainland China or overseas, choose a channel that works where you are. Important account details are provided as text and do not depend on scanning an image.",
    mainland: "Mainland China",
    overseas: "Overseas",
    official: "WeChat Official Account",
    video: "WeChat Video Channel",
    wechat: "Personal WeChat",
    accountId: "Official Account ID",
    channelId: "Video Channel ID",
    scan: "Scan the official QR code in WeChat",
    visit: "Visit",
    invitations: "Contact & Invitations",
    invitationIntro: "You are welcome to reach out regarding the following. No public form is enabled, and sensitive stories will not be collected before privacy and retention safeguards are established.",
    invitationTypes: ["Preaching invitations", "Church or ministry exchange", "Questions about faith and life", "Discipleship and formation companionship", "General contact"],
    contactNote: "Contact Paul on WeChat:",
  },
} as const;

function QrCard({src, alt, title, name, identifier, identifierLabel, scan}: {src: string; alt: string; title: string; name: string; identifier: string; identifierLabel: string; scan: string}) {
  return <article className="rounded-lg border bg-surface p-5 shadow-[var(--shadow-soft)]">
    <div className="mx-auto max-w-64 rounded-lg bg-white p-4">
      <Image src={src} alt={alt} width={785} height={785} sizes="(max-width: 640px) 75vw, 16rem" className="h-auto w-full" />
    </div>
    <h3 className="mt-5 font-serif text-2xl">{title}</h3>
    <p className="mt-2 font-medium">{name}</p>
    <p className="mt-1 break-all text-sm text-muted-foreground">{identifierLabel}: {identifier}</p>
    <p className="mt-3 text-sm text-muted-foreground">{scan}</p>
  </article>;
}

export function SocialContactPage({locale}: {locale: Locale}) {
  const c = copy[locale];
  const social = socialProfiles;
  return <>
    <section className="py-[var(--space-section)]">
      <Container>
        <Breadcrumbs locale={locale} routeId="contact" />
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{c.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{c.intro}</p>
      </Container>
    </section>

    <section className="bg-muted/60 py-[var(--space-section)]" aria-labelledby="mainland-social">
      <Container>
        <h2 id="mainland-social" className="font-serif text-3xl sm:text-4xl">{c.mainland}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <QrCard src={social.wechatOfficialAccount.qrAsset} alt={`${c.official} ${social.wechatOfficialAccount.displayName}`} title={c.official} name={`${social.wechatOfficialAccount.displayName} · ${social.wechatOfficialAccount.brand}`} identifier={social.wechatOfficialAccount.accountId} identifierLabel={c.accountId} scan={c.scan} />
          <QrCard src={social.wechatVideoChannel.qrAsset} alt={`${c.video} ${social.wechatVideoChannel.displayName}`} title={c.video} name={`${social.wechatVideoChannel.displayName} · ${social.wechatVideoChannel.brand}`} identifier={social.wechatVideoChannel.channelId} identifierLabel={c.channelId} scan={c.scan} />
        </div>
        <div className="mt-6 rounded-lg border bg-surface p-5">
          <h3 className="font-serif text-2xl">{c.wechat}</h3>
          <p className="mt-2"><span className="text-muted-foreground">WeChat ID: </span><strong>{social.personalWechat.account}</strong></p>
        </div>
      </Container>
    </section>

    <section className="py-[var(--space-section)]" aria-labelledby="overseas-social">
      <Container>
        <h2 id="overseas-social" className="font-serif text-3xl sm:text-4xl">{c.overseas}</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <ExternalCard title={social.personalYoutube.name} detail={`${social.personalYoutube.handle} · ${social.personalYoutube.positioning[locale]}`} href={social.personalYoutube.url} action={c.visit} />
          <ExternalCard title={social.churchYoutube.name} detail={social.churchYoutube.handle} href={social.churchYoutube.url} action={c.visit} />
          <ExternalCard title={social.churchWebsite.name[locale]} detail="fcfmchurch.org" href={social.churchWebsite.url} action={c.visit} />
        </div>
      </Container>
    </section>

    <section className="bg-muted/60 py-[var(--space-section)]" aria-labelledby="contact-invitations">
      <Container>
        <div className="max-w-3xl">
          <h2 id="contact-invitations" className="font-serif text-3xl sm:text-4xl">{c.invitations}</h2>
          <p className="mt-4 leading-7 text-muted-foreground">{c.invitationIntro}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">{c.invitationTypes.map((item) => <li key={item} className="rounded-md border bg-surface px-4 py-3">{item}</li>)}</ul>
          <p className="mt-6 text-lg">{c.contactNote} <strong>{social.personalWechat.account}</strong></p>
        </div>
      </Container>
    </section>
  </>;
}

function ExternalCard({title, detail, href, action}: {title: string; detail: string; href: string; action: string}) {
  return <article className="flex h-full flex-col rounded-lg border bg-surface p-5 shadow-[var(--shadow-soft)]">
    <h3 className="font-serif text-2xl">{title}</h3>
    <p className="mt-2 break-words text-sm text-muted-foreground">{detail}</p>
    <Link href={href} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center self-start rounded-md border px-4 font-medium hover:bg-muted">{action} <span aria-hidden="true" className="ml-2">↗</span></Link>
  </article>;
}
