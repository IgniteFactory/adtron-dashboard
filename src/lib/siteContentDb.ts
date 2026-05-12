import { supabase } from './supabaseClient';

export interface Testimonial {
  quote: string;
  name: string;
  biz: string;
  avatarUrl: string;
}

export interface Step {
  head: string;
  desc: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface SiteContent {
  // Analytics
  gtm_id: string;

  // Hero
  hero_headline: string;
  hero_sub: string;
  hero_cta: string;

  // Marquee
  marquee_items: string[];

  // Pain section
  pain_eyebrow: string;
  pain_headline: string;
  pain_intro: string;
  pain_intro_highlight: string;
  pain_points: string[];
  pain_closing_line1: string;
  pain_closing_line2: string;

  // Solution section
  solution_intro: string;
  solution_sub: string;

  // Testimonials
  testimonials: Testimonial[];
  stats_bar: StatItem[];

  // How to Join
  join_heading: string;
  join_sub: string;
  steps: Step[];

  // Closing CTA
  cta_heading: string;
  cta_sub: string;
  offer_bullets: string[];
}

// What the admin content editor works with (one row per editable field)
export interface ContentField {
  key: string;
  value: string;
  sectionName: string;
  sectionOrder: number;
  fieldLabel: string;
  fieldType: 'text' | 'textarea' | 'list' | 'testimonials';
}

export const SITE_CONTENT_DEFAULTS: SiteContent = {
  gtm_id: '',

  hero_headline: '20篇小红书帖子。\nRM 2,000。\n新顾客主动找上门。',
  hero_sub: '5至8家商家共摊费用，同时激活20位签约博主。你的品牌出现在潜在顾客的搜索结果里——反复出现。',
  hero_cta: '浏览当期活动榜单',

  marquee_items: [
    '小红书榜单合集', '20位签约博主', '共享营销模式', '搜索结果饱和',
    'RM 2,000起', '全程代执行', '天花板光环效应', '马来西亚首创',
  ],

  pain_eyebrow: '你是否曾经历这一幕',
  pain_headline: '你搜索过你所在\n区域的关键词吗？',
  pain_intro: '"SS15 咖啡馆推荐。"\n前排出来的，是那家你认识的店。不比你好的店。',
  pain_intro_highlight: '20 篇帖子，每一篇都在推荐它。',
  pain_points: [
    '你的店？一篇都没有。',
    '你不是没有试过——花过 RM 800 找博主合作，来了三个粉丝，零新顾客。投过 Facebook 广告，没有人走进门。',
    '问题不是你的店不够好。问题是：一两篇内容，根本无法在小红书搜索结果里形成存在感。',
  ],
  pain_closing_line1: '你的竞争对手不是比你好。',
  pain_closing_line2: '他们只是在小红书比你占据了更多的版面。',

  solution_intro: '红薯榜单不是帮你找一个博主。我们一次性激活 20 位签约博主，以榜单格式集中发布——"KL 最值得去的 8 家咖啡馆"——让你的品牌在搜索结果里密集出现。不是广告。是推荐。',
  solution_sub: '你只需要提供照片和卖点，其余全部由我们包办。',

  testimonials: [
    {
      quote: '活动结束后第一个周末，就有三个新顾客说是在小红书找到我的。光是这样，就回本了。',
      name: '刘玥婷',
      biz: 'Café 秘葉，Petaling Jaya',
      avatarUrl: 'https://picsum.photos/seed/cafe-lady-pj-01/80/80',
    },
    {
      quote: '之前花 RM 1,000 找博主，零新顾客。这次 20 篇上线后，我在小红书搜自己的店，终于能找到内容了。',
      name: '郑振翔',
      biz: '源记餐厅，Subang Jaya',
      avatarUrl: 'https://picsum.photos/seed/resto-man-subang-02/80/80',
    },
    {
      quote: '第一次试，结果比预期好很多。活动结束两周内，小红书上已经有好几个陌生客人来跟我说是看帖子过来的。',
      name: '陈美玲',
      biz: '玲玲糖水，Shah Alam',
      avatarUrl: 'https://picsum.photos/seed/dessert-lady-sha-03/80/80',
    },
  ],

  stats_bar: [
    { value: '20位', label: '签约博主 · 每期活动' },
    { value: 'RM 2,000', label: 'vs 市场行情 RM 60,000' },
    { value: '持续增长', label: '商家已完成活动' },
  ],

  join_heading: '如何加入',
  join_sub: '三步，轻松上榜',
  steps: [
    { head: '浏览当期活动', desc: '在活动页面找到最适合你品牌调性的主题榜单' },
    { head: '提交素材', desc: '填写简单表格，即可锁定名额' },
    { head: '坐等帖子上线', desc: '2 至 3 周内，20 篇博主帖子陆续发布。其余全部由我们负责' },
  ],

  cta_heading: '你的竞争对手已经在被推荐了。',
  cta_sub: '你的名字，什么时候出现在榜单上？',
  offer_bullets: [
    '20位签约博主覆盖（市场价值 RM 10,000–60,000）',
    '全程执行：博主沟通、内容创作、质量审核、排期上线',
    '榜单格式发布，天花板光环效应加持',
    '明确发布时间表，不是模糊的"大概两周"',
  ],
};

type DbRow = {
  key: string;
  value: string;
  section_name: string;
  section_order: number;
  field_label: string;
  field_type: string;
};

function safeParseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

const LS_KEY = 'redlist_site_content_v1';

function lsGet(): SiteContent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SiteContent) : null;
  } catch { return null; }
}

function lsSet(content: SiteContent): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(content)); } catch {}
}

function parseMap(map: Record<string, string>): SiteContent {
  const d = SITE_CONTENT_DEFAULTS;
  return {
    gtm_id: map.gtm_id ?? d.gtm_id,
    hero_headline: (map.hero_headline ?? d.hero_headline).replace(/\\n/g, '\n'),
    hero_sub: map.hero_sub ?? d.hero_sub,
    hero_cta: map.hero_cta ?? d.hero_cta,
    marquee_items: safeParseJson(map.marquee_items, d.marquee_items),
    pain_eyebrow: map.pain_eyebrow ?? d.pain_eyebrow,
    pain_headline: (map.pain_headline ?? d.pain_headline).replace(/\\n/g, '\n'),
    pain_intro: (map.pain_intro ?? d.pain_intro).replace(/\\n/g, '\n'),
    pain_intro_highlight: map.pain_intro_highlight ?? d.pain_intro_highlight,
    pain_points: safeParseJson(map.pain_points, d.pain_points),
    pain_closing_line1: map.pain_closing_line1 ?? d.pain_closing_line1,
    pain_closing_line2: map.pain_closing_line2 ?? d.pain_closing_line2,
    solution_intro: map.solution_intro ?? d.solution_intro,
    solution_sub: map.solution_sub ?? d.solution_sub,
    testimonials: safeParseJson(map.testimonials, d.testimonials),
    stats_bar: safeParseJson(map.stats_bar, d.stats_bar),
    join_heading: map.join_heading ?? d.join_heading,
    join_sub: map.join_sub ?? d.join_sub,
    steps: safeParseJson(map.steps, d.steps),
    cta_heading: map.cta_heading ?? d.cta_heading,
    cta_sub: map.cta_sub ?? d.cta_sub,
    offer_bullets: safeParseJson(map.offer_bullets, d.offer_bullets),
  };
}

function serializeContent(content: SiteContent): Record<string, string> {
  return {
    gtm_id: content.gtm_id,
    hero_headline: content.hero_headline,
    hero_sub: content.hero_sub,
    hero_cta: content.hero_cta,
    marquee_items: JSON.stringify(content.marquee_items),
    pain_eyebrow: content.pain_eyebrow,
    pain_headline: content.pain_headline,
    pain_intro: content.pain_intro,
    pain_intro_highlight: content.pain_intro_highlight,
    pain_points: JSON.stringify(content.pain_points),
    pain_closing_line1: content.pain_closing_line1,
    pain_closing_line2: content.pain_closing_line2,
    solution_intro: content.solution_intro,
    solution_sub: content.solution_sub,
    testimonials: JSON.stringify(content.testimonials),
    stats_bar: JSON.stringify(content.stats_bar),
    join_heading: content.join_heading,
    join_sub: content.join_sub,
    steps: JSON.stringify(content.steps),
    cta_heading: content.cta_heading,
    cta_sub: content.cta_sub,
    offer_bullets: JSON.stringify(content.offer_bullets),
  };
}

export const siteContentDb = {
  getAll: async (): Promise<SiteContent> => {
    // Try Supabase first (authoritative when table exists)
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('key, value');
      if (!error && data && data.length > 0) {
        const map: Record<string, string> = {};
        (data as { key: string; value: string }[]).forEach(r => { map[r.key] = r.value; });
        return parseMap(map);
      }
    } catch {}

    // Fall back to localStorage (works without Supabase table)
    const local = lsGet();
    if (local) return local;

    return SITE_CONTENT_DEFAULTS;
  },

  // Internal: builds map from DB row shape for getAllFields
  _parseMap: parseMap,


  // Used by the admin content editor — returns all fields with section metadata
  getAllFields: async (): Promise<ContentField[]> => {
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value, section_name, section_order, field_label, field_type')
      .order('section_order', { ascending: true });

    if (error || !data) return [];

    return (data as DbRow[]).map(r => ({
      key: r.key,
      value: r.value,
      sectionName: r.section_name,
      sectionOrder: r.section_order,
      fieldLabel: r.field_label,
      fieldType: r.field_type as ContentField['fieldType'],
    }));
  },

  // Save one or many fields by key
  setMany: async (updates: Record<string, string>): Promise<void> => {
    const rows = Object.entries(updates).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from('site_content')
      .upsert(rows, { onConflict: 'key' });
    if (error) throw error;
  },

  // Save entire SiteContent object — always writes localStorage, attempts Supabase
  setAll: async (content: SiteContent): Promise<{ supabaseSynced: boolean }> => {
    lsSet(content);
    try {
      await siteContentDb.setMany(serializeContent(content));
      return { supabaseSynced: true };
    } catch {
      return { supabaseSynced: false };
    }
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('campaign-images').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('campaign-images').getPublicUrl(path);
    return data.publicUrl;
  },
};
