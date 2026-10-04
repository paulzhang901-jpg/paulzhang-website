import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Container, ReadingContainer } from "@/components/layout/container";
import { Section, SectionHeading } from "@/components/layout/section";
import type { Locale } from "@/config/i18n";
import { socialProfiles } from "@/data/social-links";

const policy = {
  "zh-CN": {
    "title": "隐私政策",
    "date": "生效日期：2026年10月4日",
    "contact": "教会官网与联系渠道",
    "sections": [
      [
        "适用范围",
        "本隐私政策适用于印城第一华人循理会（First Chinese Free Methodist Church of Indianapolis，以下简称“教会”）的同名移动应用及其相关在线服务。本政策说明这些服务的信息处理方式；它并非 paulzhang.org 全站的隐私政策。"
      ],
      [
        "应用提供的信息",
        "应用主要提供公开的教会信息，包括讲道、查经、每周通报、主日崇拜安排、教会介绍、会员申请说明、奉献信息及英语学习内容。应用不要求用户创建账号或登录。"
      ],
      [
        "可能处理的信息",
        "访问应用内容时，后台和基础设施服务可能处理 IP 地址、由 IP 或网络信息推断的大致位置、设备或客户端信息、请求信息以及诊断、服务或 API 日志信息。这些信息可能在正常网络请求和服务运行过程中产生。这里所述的大致位置是网络推断信息，不代表应用通过 GPS 获取精确位置。"
      ],
      [
        "信息的使用目的",
        "相关技术与服务信息可能用于提供用户请求的内容、运行后台服务、维护安全、排查错误，以及维护服务可靠性和性能。"
      ],
      [
        "第三方服务提供商",
        "应用使用 Supabase 提供后台与 API 基础设施。后台、云端和其他基础设施提供商可能代表教会处理提供其服务所必需的技术信息。其具体处理和保留实践受适用的服务安排、提供商政策及法律约束。本政策不声称这些提供商没有日志或不保留任何信息。"
      ],
      [
        "追踪与广告",
        "本应用并非为跨第三方应用或网站追踪用户以投放广告而设计。"
      ],
      [
        "信息共享与出售",
        "教会不出售用户的个人信息。提供服务所必需的信息可能由后台或基础设施服务提供商处理；在适用法律要求或为维护服务安全所必需时，也可能披露相关信息。"
      ],
      [
        "信息保留",
        "技术与服务信息可能仅在运营、安全、法律或服务提供商要求所必要的期间内保留，并受适用的提供商实践和法律约束。不同信息可能适用不同的保留规则；本政策不承诺未经核实的固定保留期限或删除时间表。"
      ],
      [
        "儿童隐私",
        "儿童使用应用时，建议由父母或监护人指导。请勿通过联系渠道发送不必要的儿童个人信息。如您对儿童相关信息的处理有疑问，请联系教会，以便核查并采取适当措施。"
      ],
      [
        "安全",
        "教会采取合理的行政与技术措施保护其负责处理的信息，并依赖服务提供商的相关安全措施。任何网络传输或存储方式都无法保证绝对安全。"
      ],
      [
        "用户选择与隐私请求",
        "您可以停止使用应用，并通过教会官网提供的联系渠道提出隐私问题，以及访问、更正或删除相关个人信息的请求。教会会根据能够识别和访问的信息、适用法律以及合理的安全与记录保存要求审查请求；并非所有提供商日志都能按个人检索或删除。"
      ],
      [
        "外部链接与服务",
        "应用可能打开教会网站或其他外部网站与服务。您在这些服务中主动提供的信息及其处理方式受相应服务的隐私政策约束，请在使用前查阅。"
      ],
      [
        "本政策的变更",
        "本政策可能随服务或相关要求的变化而更新。更新将在本页面公布，生效日期也会相应调整。"
      ],
      [
        "联系教会",
        "负责组织：印城第一华人循理会 / First Chinese Free Methodist Church of Indianapolis。有关本应用的隐私问题或请求，请访问下方教会官网，并使用该网站公布的联系渠道。"
      ]
    ]
  },
  "en-US": {
    "title": "Privacy Policy",
    "date": "Effective Date: October 4, 2026",
    "contact": "Church website and contact channels",
    "sections": [
      [
        "Scope",
        "This Privacy Policy applies to the mobile application 印城第一华人循理会, identified in English as First Chinese Free Methodist Church of Indianapolis, and its related online services, operated by the church (the “Church”). It explains information handling for those services; it is not a site-wide privacy policy for paulzhang.org."
      ],
      [
        "Information the App Provides",
        "The App primarily provides public church information, including sermons, Bible studies, weekly bulletins, Sunday service schedules, church information, membership application information, giving information, and English learning content. Users are not required to create an account or log in."
      ],
      [
        "Information That May Be Processed",
        "When you access App content, backend and infrastructure services may process IP addresses, approximate location inferred from IP or network information, device or client information, request information, and diagnostic, service, or API log information. Such information may arise through ordinary network requests and service operation. Approximate location here means network-derived information, not precise location obtained by the App through GPS."
      ],
      [
        "How Information Is Used",
        "Technical and service information may be used to provide requested content, operate backend services, maintain security, troubleshoot errors, and maintain service reliability and performance."
      ],
      [
        "Third-Party Service Providers",
        "The App uses Supabase for backend and API infrastructure. Backend, cloud, and other infrastructure providers may process technical information on behalf of the Church as necessary to provide their services. Specific processing and retention practices are subject to applicable service arrangements, provider policies, and law. This policy does not claim that providers keep no logs or retain no information."
      ],
      [
        "Tracking and Advertising",
        "The App is not designed to track users across third-party apps or websites for advertising purposes."
      ],
      [
        "Sharing and Sale of Information",
        "The Church does not sell users’ personal information. Information necessary to provide services may be processed by backend or infrastructure providers. Relevant information may also be disclosed where required by applicable law or necessary to maintain service security."
      ],
      [
        "Data Retention",
        "Technical and service information may be retained only as necessary for operational, security, legal, or service-provider requirements, subject to applicable provider practices and law. Different information may be subject to different retention rules. This policy does not promise an unverified fixed retention period or deletion schedule."
      ],
      [
        "Children’s Privacy",
        "Parents or guardians are encouraged to guide children’s use of the App. Please do not send unnecessary personal information about children through contact channels. If you have concerns about the handling of information relating to a child, contact the Church so it can review the concern and take appropriate action."
      ],
      [
        "Security",
        "The Church uses reasonable administrative and technical safeguards for information it handles and relies on relevant safeguards provided by service providers. No method of network transmission or storage can guarantee absolute security."
      ],
      [
        "User Choices and Privacy Requests",
        "You may stop using the App and use the contact channels on the Church website to raise privacy questions or request access to, correction of, or deletion of relevant personal information. The Church will review requests based on information it can identify and access, applicable law, and reasonable security and recordkeeping requirements. Not all provider logs can be located or deleted for an individual."
      ],
      [
        "External Links and Services",
        "The App may open the Church website or other external websites and services. Information you voluntarily provide to those services and its handling are governed by their respective privacy policies. Please review those policies before using the services."
      ],
      [
        "Changes to This Policy",
        "This policy may be updated as services or relevant requirements change. Updates will be published on this page, and the effective date will be adjusted accordingly."
      ],
      [
        "Contact the Church",
        "Responsible organization: First Chinese Free Methodist Church of Indianapolis / 印城第一华人循理会. For privacy questions or requests concerning this App, visit the Church website below and use the contact channels published there."
      ]
    ]
  }
} as const;

export function AppPrivacyPolicyPage({locale}: {locale: Locale}) {
  const copy = policy[locale];
  return <Section><Container>
    <Breadcrumbs locale={locale} routeId="legal-privacy" />
    <ReadingContainer className="px-0">
      <SectionHeading title={copy.title}><p>{copy.date}</p></SectionHeading>
      <article className="space-y-8">
        {copy.sections.map(([title, text], index) => <section key={title}>
          <h2 className="mb-3 font-serif text-2xl">{index + 1}. {title}</h2>
          <p className="leading-8 text-muted-foreground">{text}</p>
        </section>)}
        <p><a className="text-primary underline underline-offset-4" href={socialProfiles.churchWebsite.url}>{copy.contact}: fcfmchurch.org</a></p>
      </article>
    </ReadingContainer>
  </Container></Section>;
}
