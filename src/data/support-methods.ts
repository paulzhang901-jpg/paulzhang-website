import type { Locale } from "@/config/i18n";

export const supportMethods = [
  {id: "wechat-pay", region: "china", displayName: {"zh-CN": "微信支付", "en-US": "WeChat Pay"}, recipientName: "Paul Zhang(**助)", assetPath: "/assets/support/wechat-pay-support-qr.jpeg", width: 828, height: 1124, scan: {"zh-CN": "微信扫一扫", "en-US": "Scan with WeChat Pay"}, alt: "微信支付支持 Paul Zhang 二维码 / WeChat Pay support QR code for Paul Zhang"},
  {id: "alipay", region: "china", displayName: {"zh-CN": "支付宝", "en-US": "Alipay"}, recipientName: "Paul Zhang(**助)", assetPath: "/assets/support/alipay-support-qr.jpeg", width: 1708, height: 2560, scan: {"zh-CN": "打开支付宝扫一扫", "en-US": "Scan with Alipay"}, alt: "支付宝支持 Paul Zhang 二维码 / Alipay support QR code for Paul Zhang"},
  {id: "paypal", region: "international", displayName: {"zh-CN": "PayPal", "en-US": "PayPal"}, recipientName: "Chongzhu Zhang", assetPath: "/assets/support/paypal-support-qr.jpeg", width: 1284, height: 2778, scan: {"zh-CN": "扫描 PayPal 二维码", "en-US": "Scan with PayPal"}, alt: "PayPal support QR code for Chongzhu Zhang"},
  {id: "zelle", region: "international", displayName: {"zh-CN": "Zelle", "en-US": "Zelle"}, recipientName: null, assetPath: "/assets/support/zelle-support-qr.jpeg", width: 1284, height: 857, scan: {"zh-CN": "使用银行 App 或 Zelle 扫描二维码", "en-US": "Scan with your banking app or Zelle"}, alt: "Zelle support QR code for Paul Zhang"},
] as const;

export const supportCopy = {
  "zh-CN": {
    title: "支持这份工作", label: "支持", personal: "Paul Zhang · 个人支持",
    hero: [
      "多年来，我一直在牧会、讲道、写作、学习，也努力把自己的经历、信仰反思、讲道信息和学习资源整理出来，与更多人分享。",
      "我希望这个网站上的许多文章、讲道、见证和学习资源能够持续免费开放，让有需要的人可以自由阅读、观看和使用。",
      "如果这些内容曾经帮助过你，而你也愿意支持我继续写作、研究、制作内容和开展相关的个人事工，欢迎按照自己的感动和能力，自愿支持。",
      "你的支持不是使用这些内容的条件。",
      "无论是否提供经济支持，你都同样欢迎来到这里阅读、学习、交流和同行。",
      "我也鼓励你首先照顾好自己的家庭责任，并支持你所委身的本地教会。",
    ],
    oneTime: "一次支持", oneTimeBody: "你可以按照自己的感动和能力提供一次支持，金额完全由你决定。",
    ongoing: "持续同行", ongoingBody: "如果你愿意长期支持我的写作、研究、内容制作和个人事工，也可以按照自己方便的方式定期支持。",
    recurringNote: "持续同行由你自行安排；本页面不会开通订阅或自动每月扣款。",
    regions: {china: {title: "中国大陆", intro: "如果你在中国大陆，可以选择微信支付或支付宝，以自己最方便的方式提供自愿支持。"}, international: {title: "海外支持", intro: "如果你在海外，可以使用 PayPal 或 Zelle。"}},
    methodDescription: "自愿支持 Paul 的写作、研究、内容创作、学习资源与相关个人事工。",
    recipient: "收款人", original: "查看原始二维码图片", scanHelp: "请在相应支付 App 中扫描，并在确认付款前核对收款人和金额。你也可以打开原图，使用另一台设备扫描。",
    nonFinancialTitle: "支持不只有一种方式",
    nonFinancial: ["如果你现在不方便提供经济支持，也完全没有关系。", "为我和我的服事祷告、分享一篇对你有帮助的文章、订阅我的频道、给我一些反馈，或者把这个网站介绍给一个正在寻找帮助的人，都是非常宝贵的支持。"],
    noticeTitle: "关于个人支持",
    notice: [
      "本页面仅用于支持 Paul Zhang（张崇助）的个人写作、研究、内容创作、学习资源及相关个人事工。",
      "本网站不接受 First Chinese Free Methodist Church 的教会奉献。",
      "如果你希望向教会奉献，请前往教会官方网站，并使用教会自己的官方奉献渠道。",
      "通过本页面所列的微信支付、支付宝、PayPal、Zelle 或其他 Paul 个人支付方式提供的支持，与教会奉献分别管理。",
      "这些款项不应被表示为对 First Chinese Free Methodist Church 的奉献，也不应被表示为可抵税的慈善捐赠（tax-deductible charitable contribution）。",
      "所有支持均出于自愿，也不是访问本网站免费内容的条件。",
      "有关个人税务处理，请根据自己的情况咨询合格的税务专业人士。",
    ],
    churchTitle: "想支持我所服事的教会？", churchBody: "如果你希望奉献给 First Chinese Free Methodist Church，请直接前往教会官方网站。教会奉献与 Paul 的个人支持分别管理。", churchLink: "前往教会网站",
    home: "如果这里的内容曾经帮助过你，也欢迎支持这份持续的工作。", homeLink: "了解如何支持 →",
  },
  "en-US": {
    title: "Support This Work", label: "Support", personal: "Paul Zhang · Personal Support",
    hero: [
      "For many years, I have been serving in pastoral ministry, preaching, writing, studying, and sharing what I am learning through sermons, reflections, life stories, and educational resources.",
      "My hope is that many of the articles, sermons, testimonies, and learning resources on this website can remain freely available to those who may benefit from them.",
      "If this work has been helpful to you and you would like to support my continued writing, research, content creation, and related personal ministry work, you are welcome to do so voluntarily and according to your own circumstances.",
      "Financial support is never required to access the free content on this website.",
      "Whether or not you give financially, you are equally welcome to read, learn, connect, and journey together here.",
      "I also encourage you to give priority to your family responsibilities and to faithfully support your local church.",
    ],
    oneTime: "One-time Support", oneTimeBody: "You may give a one-time amount according to your own circumstances. The amount is entirely your choice.",
    ongoing: "Ongoing Support", ongoingBody: "If you would like to support my writing, research, content creation, and personal ministry work over time, you may also choose to give regularly in whatever way is convenient for you.",
    recurringNote: "You arrange any ongoing support yourself. This page does not start a subscription or automatic monthly payments.",
    regions: {china: {title: "Mainland China", intro: "If you are in mainland China, you may choose WeChat Pay or Alipay for voluntary personal support."}, international: {title: "International Support", intro: "If you are overseas, you may use PayPal or Zelle."}},
    methodDescription: "Voluntary personal support for Paul's writing, research, content creation, learning resources, and related personal ministry work.",
    recipient: "Recipient", original: "View original QR image", scanHelp: "Scan in the corresponding payment app, and check the recipient and amount before confirming payment. You can also open the original image and scan it with another device.",
    nonFinancialTitle: "There Are Many Ways to Support",
    nonFinancial: ["If financial support is not something you can or wish to do, that is completely fine.", "Praying for me and my ministry, sharing an article that helped you, subscribing to my channels, sending thoughtful feedback, or introducing this website to someone who may benefit from it are all meaningful ways to support this work."],
    noticeTitle: "About Personal Support",
    notice: [
      "This page is solely for voluntary support of Paul Zhang's personal writing, research, content creation, learning resources, and related personal ministry work.",
      "This website does not accept contributions to First Chinese Free Methodist Church.",
      "If you wish to give to the church, please visit the church's official website and use its official giving channels.",
      "Support provided through WeChat Pay, Alipay, PayPal, Zelle, or other personal payment methods listed on this page is administered separately from church contributions.",
      "Such payments should not be represented as contributions to First Chinese Free Methodist Church or as tax-deductible charitable contributions.",
      "All support is voluntary and is not required to access the free content available on this website.",
      "For individual tax questions, please consult a qualified tax professional.",
    ],
    churchTitle: "Want to Give to the Church?", churchBody: "If you wish to give to First Chinese Free Methodist Church, please visit the church's official website directly. Church contributions and Paul's personal support are administered separately.", churchLink: "Visit Church Website",
    home: "If this work has been helpful to you, you are welcome to support its continuation.", homeLink: "Learn How to Support →",
  },
} as const satisfies Record<Locale, unknown>;

export const churchGivingWebsite = "https://fcfmchurch.org";
