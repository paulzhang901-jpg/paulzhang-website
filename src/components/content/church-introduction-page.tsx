import Link from "next/link";
import type {Route} from "next";
import type {ContentLanguage} from "@/types/content";
import {churchProfile} from "@/data/church";

const copy={
  "zh-CN":{
    title:"印城第一华人循理会", subtitle:"The First Chinese Free Methodist Church of Indianapolis", abbreviation:"FCFMC",
    who:"我们是谁",
    whoBody:["印城第一华人循理会（The First Chinese Free Methodist Church of Indianapolis，FCFMC）是一间服事印第安纳波利斯地区华人及家庭的基督教会，属于 Free Methodist Church（循理会）传统。","我们盼望借着敬拜、圣经教导、门徒训练、团契生活、祷告和社区服事，帮助人认识耶稣基督，在恩典中成长，并在日常生活中活出信仰。"],
    heritage:"我们的宗派传统",
    heritageBody:["我们属于 Free Methodist Church。循理会源自卫斯理宗（Wesleyan）传统，并于 1860 年在美国正式成立。","这一传统持守圣经的权威，宣讲因恩典、借着信心得救，并强调成圣与圣洁生活。循理会也珍视圣灵引导下敬拜的自由，重视每个人的尊严、对社会需要的关怀，以及把福音带向社区和世界的使命。"],
    conference:"我们的属灵归属",
    conferenceBody:["印城第一华人循理会属于 Free Methodist Church，并连接于 Crossroads Conference。","Crossroads Conference 是现今我们所在的年议会架构。过去网站中关于 Wabash Conference 与 New South Conference 的旧表述已经过时，本页不再把它们显示为教会现行的两个 Conference。"],
    where:"我们现在在哪里",
    whereBody1:"我们目前没有自己的教堂建筑，而是借用其他教会的场地举行主日敬拜及相关聚会。",
    location:"目前我们在 Greenfield 的聚会地点：",
    whereBody2:["我们感谢神在这个过渡时期为教会预备聚会的地方，也感谢接待我们的教会群体。","同时，我们继续祷告并寻找一个适合教会长期敬拜、门徒训练、儿童与青少年事工、团契和社区服事的永久场所。"],
    home:"寻找一个可以扎根的家",
    homeBody:["我们正在祷告并寻找一个适合教会长期发展的永久聚会场所。","我们所寻找的，不只是一个星期日举行礼拜的建筑，而是一个可以敬拜神、培育门徒、陪伴儿童与青少年、建立团契、接待新朋友，并长期服事社区的家。","我们相信，教会首先是神所呼召的一群人；建筑不是教会本身，却可以成为承载敬拜、门训、团契与使命的重要空间。"],
    online:"在线认识我们", website:"教会官方网站", youtube:"教会官方 YouTube", visit:"访问",
    ctaCommunity:"了解我们的群体", ctaContact:"联系我们", ctaSunday:"主日信息与活动",
  },
  "en-US":{
    title:"The First Chinese Free Methodist Church of Indianapolis", subtitle:"FCFMC", abbreviation:"FCFMC",
    who:"Who We Are",
    whoBody:["The First Chinese Free Methodist Church of Indianapolis (FCFMC) is a Christian congregation serving Chinese-speaking people and families in the greater Indianapolis area within the Free Methodist tradition.","Through worship, biblical teaching, discipleship, fellowship, prayer, and community ministry, we seek to help people know Jesus Christ, grow in grace, and live out their faith in everyday life."],
    heritage:"Our Free Methodist Heritage",
    heritageBody:["We belong to the Free Methodist Church, a denomination rooted in the Wesleyan tradition and formally organized in the United States in 1860.","This tradition affirms the authority of Scripture, salvation by grace through faith, and entire sanctification expressed in holy living. Free Methodists also value freedom in Spirit-led worship, the dignity of every person, compassionate engagement with social needs, and the mission of carrying the gospel into our communities and the world."],
    conference:"Our Conference",
    conferenceBody:["The First Chinese Free Methodist Church of Indianapolis is part of the Free Methodist Church and is connected with the Crossroads Conference.","Crossroads Conference is our current conference structure. Older website wording that presented Wabash Conference and New South Conference as two current conferences is outdated and is not carried forward here."],
    where:"Where We Gather Today",
    whereBody1:"We currently do not own a church building. During this season, we gather for Sunday worship and other ministries in space graciously shared with us by another church community.",
    location:"Current gathering location:",
    whereBody2:["We are grateful for God’s provision during this season of transition and for the church community that has welcomed us.","At the same time, we continue to pray and search for a permanent home where our congregation can worship, make disciples, nurture children and youth, share life together, and serve the surrounding community."],
    home:"Looking for a Place to Call Home",
    homeBody:["We are praying and searching for a permanent gathering place where our church can grow and serve for the long term.","We are looking for more than a building for Sunday worship. We hope for a home where we can worship God, form disciples, nurture children and youth, build fellowship, welcome new friends, and serve the community over time.","We believe the church is first a people called by God. A building is not the church itself, but it can become an important space for worship, discipleship, fellowship, and mission."],
    online:"Connect With Our Church Online", website:"Church Website", youtube:"Church YouTube", visit:"Visit",
    ctaCommunity:"Explore Our Community", ctaContact:"Contact Us", ctaSunday:"Sunday Worship & Activities",
  },
} as const;

const prefix=(locale:ContentLanguage)=>locale==="en-US"?"/en":"";
const paragraphs=(items:readonly string[])=>items.map(item=><p key={item} className="mt-4 max-w-3xl leading-7 text-muted-foreground">{item}</p>);

export function ChurchIntroductionPage({locale}:{locale:ContentLanguage}){const c=copy[locale];return <>
  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{c.abbreviation}</p>
  <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">{c.title}</h1>
  {locale==="zh-CN"?<p className="mt-3 max-w-3xl text-lg text-muted-foreground">{c.subtitle}</p>:null}

  <section className="mt-12 border-t pt-10" aria-labelledby="church-who"><h2 id="church-who" className="font-serif text-3xl">{c.who}</h2>{paragraphs(c.whoBody)}</section>
  <section className="mt-12 border-t pt-10" aria-labelledby="church-heritage"><h2 id="church-heritage" className="font-serif text-3xl">{c.heritage}</h2>{paragraphs(c.heritageBody)}</section>
  <section className="mt-12 border-t pt-10" aria-labelledby="church-conference"><h2 id="church-conference" className="font-serif text-3xl">{c.conference}</h2>{paragraphs(c.conferenceBody)}<p className="mt-5 inline-flex rounded-md border bg-muted/50 px-4 py-3 font-medium">Crossroads Conference · Free Methodist Church</p></section>
  <section className="mt-12 border-t pt-10" aria-labelledby="church-location"><h2 id="church-location" className="font-serif text-3xl">{c.where}</h2><p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{c.whereBody1}</p><div className="mt-6 max-w-xl rounded-lg border bg-surface p-6 shadow-[var(--shadow-soft)]"><p className="text-sm font-semibold text-primary">{c.location}</p><address className="mt-3 not-italic text-xl font-semibold leading-8"><span className="block">{churchProfile.gatheringLocation.street}</span><span className="block">{churchProfile.gatheringLocation.cityRegionPostal}</span></address></div>{paragraphs(c.whereBody2)}</section>
  <section className="mt-12 border-t pt-10" aria-labelledby="church-home"><h2 id="church-home" className="font-serif text-3xl">{c.home}</h2>{paragraphs(c.homeBody)}</section>
  <section className="mt-12 border-t pt-10" aria-labelledby="church-online"><h2 id="church-online" className="font-serif text-3xl">{c.online}</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><ExternalCard title={c.website} detail="fcfmchurch.org" href={churchProfile.website.url} action={c.visit}/><ExternalCard title={c.youtube} detail={churchProfile.youtube.handle} href={churchProfile.youtube.url} action={c.visit}/></div></section>
  <nav aria-label={locale==="zh-CN"?"教会下一步":"Church next steps"} className="mt-12 flex flex-wrap gap-3 border-t pt-8"><Link href={`${prefix(locale)}/community` as Route} className="inline-flex min-h-11 items-center rounded-md border px-4 font-medium hover:bg-muted">{c.ctaCommunity}</Link><Link href={`${prefix(locale)}/about/contact` as Route} className="inline-flex min-h-11 items-center rounded-md border px-4 font-medium hover:bg-muted">{c.ctaContact}</Link><Link href={`${prefix(locale)}/community/sunday` as Route} className="inline-flex min-h-11 items-center rounded-md border px-4 font-medium hover:bg-muted">{c.ctaSunday}</Link></nav>
</>}

function ExternalCard({title,detail,href,action}:{title:string;detail:string;href:string;action:string}){return <article className="flex h-full flex-col rounded-lg border bg-surface p-5 shadow-[var(--shadow-soft)]"><h3 className="font-serif text-2xl">{title}</h3><p className="mt-2 break-words text-sm text-muted-foreground">{detail}</p><Link href={href} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center self-start rounded-md border px-4 font-medium hover:bg-muted">{action}<span aria-hidden="true" className="ml-2">↗</span></Link></article>}
