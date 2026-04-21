export const FAQ_CATEGORIES = [
  "关于红薯榜单",
  "合作模式与流程",
  "博主与内容",
  "费用与支付",
  "效果与报告",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  displayStatus: boolean;
  createdAt: string;
}

const DEFAULT_FAQS: FAQ[] = [
  {
    id: "faq-1",
    question: '什么是"红薯榜单"？',
    answer: '简单来说，红薯榜单是全马首个"商家拼单"营销平台。我们聚集数位志同道合的商家，共同分摊20位小红书博主的营销费用，以"团购"模式，让中小商家也能享受到霸屏级的品牌曝光。',
    category: "关于红薯榜单",
    displayStatus: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-2",
    question: "为什么价格能做到这么便宜？是不是有什么隐藏收费？",
    answer: '价格优惠的核心在于"成本分摊"。您的费用是和榜单上的其他商家一起承担的，所以能用一小份预算，撬动整个博主团队。我们承诺，所有费用都是一次性的，绝无任何隐藏收费。',
    category: "关于红薯榜单",
    displayStatus: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-3",
    question: "我的生意不在雪隆区，可以参加吗？",
    answer: '当然可以！我们会根据不同地区和城市，策划相应的主题榜单，例如"槟城宠物Friendly茶餐室"或"新山周末好去处"等。欢迎全马各地的商家关注我们的活动。',
    category: "关于红薯榜单",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-4",
    question: "红薯榜单和普通的营销公司有什么不同？",
    answer: '最大的不同在于"模式"和"性价比"。传统营销公司是一对一服务，价格高昂。我们是通过"多对多"的拼单模式，专注于小红书"合集帖"这一细分领域，为您提供极致性价比的解决方案。',
    category: "关于红薯榜单",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-5",
    question: "你们只做小红书吗？",
    answer: '是的，目前我们专注于小红书平台。因为我们相信，专注才能做到极致。小红书的"搜索特性"和"种草文化"非常适合我们的榜单模式，能为商家带来最直接的转化效果。',
    category: "关于红薯榜单",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-6",
    question: "这个服务适合什么样的商家？",
    answer: "特别适合希望在小红书上提升知名度，但预算有限、或没有时间精力自己对接网红的本地中小型商家，例如餐饮、零售、美容、休闲娱乐等。",
    category: "关于红薯榜单",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-7",
    question: "整个合作流程是怎样的？",
    answer: "非常简单，只需三步：1. 在我们的网站上浏览并选择您想加入的活动榜单；2. 填写简单的申请表格并完成支付；3. 等待我们的团队联系您，索取必要的品牌资料。之后就交给我们了！",
    category: "合作模式与流程",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-8",
    question: "我需要提供什么资料给你们？",
    answer: "您需要提供大约10张高清的业务/产品照片或短视频、品牌Logo，以及您希望博主在笔记中提及的3-5个核心卖点 (Key Points)。",
    category: "合作模式与流程",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-9",
    question: "我需要自己写文案吗？",
    answer: '完全不需要。您只需提供核心卖点，我们的专业内容团队会根据活动主题和您的素材，策划出最吸引人的"种草"文案框架。',
    category: "合作模式与流程",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-10",
    question: "整个流程需要多长时间？",
    answer: "从您报名成功并提交完整资料后，一般需要2-3周的时间进行内容策划、博主沟通和最终的发布。具体时间会根据活动排期而定。",
    category: "合作模式与流程",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-11",
    question: "如果我的竞争对手也加入了同一个榜单怎么办？",
    answer: '我们会尽量确保每个榜单中的商家都具有独特性，避免直接的恶性竞争。例如，在一个咖啡馆榜单中，我们会挑选风格各异的商家（如工业风、ins风、宠物友好型等），共同打造一个丰富多元的"必打卡"清单。',
    category: "合作模式与流程",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-12",
    question: "每个榜单有多少个商家名额？",
    answer: "为了保证榜单内容的质量和每个商家的曝光度，我们的榜单通常只开放5-8个商家名额。",
    category: "合作模式与流程",
    displayStatus: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-13",
    question: "我可以建议一个新的榜单主题吗？",
    answer: "非常欢迎！如果您有好的想法，或者希望为您的行业或地区发起一个新的榜单，可以随时联系我们。如果我们觉得可行，会进行策划并优先邀请您加入。",
    category: "合作模式与流程",
    displayStatus: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-14",
    question: "博主真的不会来我的店里探店吗？",
    answer: "是的。这是一个纯线上的内容合作模式，博主会根据我们提供的高质量素材和文案框架进行创作。",
    category: "合作模式与流程",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-15",
    question: "为什么博主不来探店？这样内容真实吗？",
    answer: '这正是我们能提供极致性价比的关键！这种模式为您节省了招待博主的成本（免费产品/餐点）和时间。我们会严格把关，确保博主用真实的、符合"种草"风格的语气进行创作，让内容看起来自然可信。',
    category: "合作模式与流程",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-16",
    question: "如果活动开始了，我中途可以退出吗？",
    answer: "由于活动是集体性质的，一旦报名并支付成功，我们就已经开始为您锁定博主资源和进行内容策划。因此，中途无法退出或退款，敬请谅解。",
    category: "合作模式与流程",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-17",
    question: "报名成功后，接下来会发生什么？",
    answer: "在您成功报名后，我们的合作流程将分为清晰的三大步：\n\n1. 确认与对接 (Confirmation & Briefing): 我们的活动专员会在1-2个工作日内联系您，再次确认您的业务符合活动主题。一旦确认，我们将为您正式锁定一个宝贵的榜单名额。\n\n2. 素材与沟通 (Material & Angle Discussion): 接下来，我们会向您索取10-20张高清的业务照片/视频，并与您进行一次简短的沟通，深入了解您的品牌特色，共同探讨最能吸引顾客的介绍角度。\n\n3. 创作与排期 (Creation & Scheduling): 我们的内容团队会将所有素材整合，精心策划笔记内容，并分发给20位博主。我们会为您量身定制一个为期2-3周的黄金发布排期，确保曝光效果最大化。\n\n整个过程大约需要3-4个星期，您只需轻松配合，坐等曝光！",
    category: "合作模式与流程",
    displayStatus: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-18",
    question: "这20位博主会同时发布吗？",
    answer: '不会的，这也是我们策略的优势所在。\n\n我们不会在几天内集中"轰炸式"地发布所有笔记，而是会在2-3周的时间内，有策略地、逐一发布这20篇内容。\n\n这种"细水长流"的发布方式，更符合小红书的算法推荐机制，可以有效避免被平台"限流"，确保每一篇笔记都能获得更健康的自然流量。这样做的好处是，您的品牌热度不是昙花一现，而是在数周内持续发酵，形成更长久的话题效应。',
    category: "效果与报告",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-19",
    question: "请问活动费用是多少？是否包含SST？以及如何支付？",
    answer: "本次活动的统一费用为RM2000，此费用不包含SST。\n\n关于支付方式，在您提交申请表格后，我们的活动专员会主动与您取得联系。专员会进一步确认您的申请信息，并引导您通过银行转账的方式完成费用支付。",
    category: "费用与支付",
    displayStatus: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-20",
    question: "如果我介绍朋友的店参加，有优惠吗？",
    answer: "我们非常鼓励商家推荐！请关注我们的推荐计划，或者直接联系我们的客服了解详情。",
    category: "费用与支付",
    displayStatus: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-21",
    question: "发布的笔记会是什么样的？",
    answer: '是小红书上非常受欢迎的"合集帖"或"清单"格式，例如"KL必吃的8家Cafe"。您的品牌会作为清单中的一员被重点介绍。',
    category: "博主与内容",
    displayStatus: true,
    createdAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = "redlist_faqs_v1";

export const faqDb = {
  getFaqs: (): FAQ[] => {
    if (typeof window === "undefined") return DEFAULT_FAQS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FAQS));
      return DEFAULT_FAQS;
    }
    return JSON.parse(stored) as FAQ[];
  },

  saveFaqs: (faqs: FAQ[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(faqs));
    }
  },

  addFaq: (faq: Omit<FAQ, "id" | "createdAt">): FAQ => {
    const faqs = faqDb.getFaqs();
    const newFaq: FAQ = {
      ...faq,
      id: `faq-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    faqDb.saveFaqs([...faqs, newFaq]);
    return newFaq;
  },

  updateFaq: (id: string, updates: Partial<Omit<FAQ, "id" | "createdAt">>): FAQ | null => {
    const faqs = faqDb.getFaqs();
    const idx = faqs.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    faqs[idx] = { ...faqs[idx], ...updates };
    faqDb.saveFaqs(faqs);
    return faqs[idx];
  },

  deleteFaq: (id: string): void => {
    const faqs = faqDb.getFaqs().filter((f) => f.id !== id);
    faqDb.saveFaqs(faqs);
  },

  getFaqsForDisplay: (): FAQ[] => {
    return faqDb.getFaqs().filter((f) => f.displayStatus);
  },
};
