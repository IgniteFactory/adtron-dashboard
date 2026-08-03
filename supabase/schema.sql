-- =============================================================================
-- 红薯榜单 (Redlist) — Supabase Schema History
-- Project: adtron-dashboard
-- =============================================================================
-- All SQL migrations run against the Supabase project, in chronological order.
-- Run these in the Supabase Dashboard → SQL Editor.
-- =============================================================================


-- =============================================================================
-- MIGRATION 001 — Initial tables (no auth)
-- Status: SUPERSEDED by Migration 002
-- =============================================================================
/*
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.merchants CASCADE;

CREATE TABLE public.merchants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text,
  "companyName" text,
  "picName" text,
  phone text,
  "createdAt" timestamp with time zone DEFAULT now()
);

CREATE TABLE public.campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text,
  location text,
  audience text,
  description text,
  "targetSlots" integer DEFAULT 0,
  "realFilledSlots" integer DEFAULT 0,
  "manualBoost" integer DEFAULT 0,
  status text DEFAULT 'recruiting',
  image text,
  posters text[],
  "createdAt" timestamp with time zone DEFAULT now(),
  "completedAt" timestamp with time zone
);

CREATE TABLE public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "companyName" text,
  phone text,
  "picName" text,
  "campaignId" uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  "createdAt" timestamp with time zone DEFAULT now()
);

ALTER TABLE public.merchants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
*/


-- =============================================================================
-- MIGRATION 002 — Supabase Auth integration + RLS policies
-- Status: ACTIVE
-- =============================================================================

DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.merchants CASCADE;

-- Merchants table — password removed, delegates auth to Supabase Auth
CREATE TABLE public.merchants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text UNIQUE NOT NULL,
  "companyName" text,
  "picName" text,
  phone text,
  "createdAt" timestamp with time zone DEFAULT now()
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text,
  location text,
  audience text,
  description text,
  "targetSlots" integer DEFAULT 0,
  "realFilledSlots" integer DEFAULT 0,
  "manualBoost" integer DEFAULT 0,
  status text DEFAULT 'recruiting',
  image text,
  posters text[],
  "createdAt" timestamp with time zone DEFAULT now(),
  "completedAt" timestamp with time zone
);

-- Leads table
CREATE TABLE public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "companyName" text,
  phone text,
  "picName" text,
  "campaignId" uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  "createdAt" timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_campaigns"  ON public.campaigns FOR SELECT TO public USING (true);
CREATE POLICY "public_write_campaigns" ON public.campaigns FOR ALL    TO public USING (true) WITH CHECK (true);

CREATE POLICY "public_insert_leads" ON public.leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_read_leads"   ON public.leads FOR SELECT TO public USING (true);

CREATE POLICY "public_insert_merchants" ON public.merchants FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public_read_merchants"   ON public.merchants FOR SELECT TO public USING (true);
CREATE POLICY "own_update_merchants"    ON public.merchants FOR UPDATE TO authenticated USING (user_id = auth.uid());


-- =============================================================================
-- MIGRATION 003 — Storage bucket policies for campaign images
-- Status: ACTIVE
-- =============================================================================

-- Make campaign-images bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'campaign-images';

-- Allow anyone to upload
CREATE POLICY "Allow Public Uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'campaign-images' );

-- Allow anyone to read
CREATE POLICY "Allow Public Select"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'campaign-images' );


-- =============================================================================
-- MIGRATION 004 — FAQs table + site_content table (landing page CMS)
-- Status: ACTIVE
-- =============================================================================

-- FAQs (replaces localStorage faqDb)
CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  display_status BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON faqs FOR ALL USING (true) WITH CHECK (true);

-- Site content — key-value store for landing page copy
-- (see Migration 005 below for the upgraded version with section metadata)
CREATE TABLE site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON site_content FOR ALL USING (true) WITH CHECK (true);

-- Seed default FAQs
INSERT INTO faqs (question, answer, category, display_status, sort_order) VALUES
('什么是"红薯榜单"？', '简单来说，红薯榜单是全马首个"商家拼单"营销平台。我们聚集数位志同道合的商家，共同分摊20位小红书博主的营销费用，以"团购"模式，让中小商家也能享受到霸屏级的品牌曝光。', '关于红薯榜单', true, 1),
('为什么价格能做到这么便宜？是不是有什么隐藏收费？', '价格优惠的核心在于"成本分摊"。您的费用是和榜单上的其他商家一起承担的，所以能用一小份预算，撬动整个博主团队。我们承诺，所有费用都是一次性的，绝无任何隐藏收费。', '关于红薯榜单', true, 2),
('每个榜单有多少个商家名额？', '为了保证榜单内容的质量和每个商家的曝光度，我们的榜单通常只开放5-8个商家名额。', '合作模式与流程', true, 3),
('我可以建议一个新的榜单主题吗？', '非常欢迎！如果您有好的想法，或者希望为您的行业或地区发起一个新的榜单，可以随时联系我们。如果我们觉得可行，会进行策划并优先邀请您加入。', '合作模式与流程', true, 4),
('报名成功后，接下来会发生什么？', E'在您成功报名后，我们的合作流程将分为清晰的三大步：\n\n1. 确认与对接：活动专员会在1-2个工作日内联系您，确认业务符合活动主题并锁定榜单名额。\n\n2. 素材与沟通：我们会向您索取10-20张高清的业务照片/视频，并深入了解您的品牌特色。\n\n3. 创作与排期：内容团队整合素材并分发给20位博主，为期2-3周的黄金发布排期确保曝光最大化。\n\n整个过程大约需要3-4个星期，您只需轻松配合，坐等曝光！', '合作模式与流程', true, 5),
('请问活动费用是多少？是否包含SST？以及如何支付？', E'本次活动的统一费用为RM2000，此费用不包含SST。\n\n在您提交申请表格后，我们的活动专员会主动与您联系，并引导您通过银行转账的方式完成费用支付。', '费用与支付', true, 6),
('发布的笔记会是什么样的？', '是小红书上非常受欢迎的"合集帖"或"清单"格式，例如"KL必吃的8家Cafe"。您的品牌会作为清单中的一员被重点介绍。', '博主与内容', true, 7),
('整个合作流程是怎样的？', E'非常简单，只需三步：\n1. 在我们的网站上浏览并选择您想加入的活动榜单；\n2. 填写简单的申请表格并完成支付；\n3. 等待我们的团队联系您，索取必要的品牌资料。之后就交给我们了！', '合作模式与流程', false, 8),
('我需要提供什么资料给你们？', '您需要提供大约10张高清的业务/产品照片或短视频、品牌Logo，以及您希望博主在笔记中提及的3-5个核心卖点。', '合作模式与流程', false, 9),
('这20位博主会同时发布吗？', E'不会的。我们会在2-3周的时间内，有策略地逐一发布这20篇内容。\n\n这种"细水长流"的发布方式更符合小红书的算法推荐机制，可以有效避免被平台限流，确保每一篇笔记都能获得更健康的自然流量。', '效果与报告', false, 10);


-- =============================================================================
-- MIGRATION 005 — site_content: add section metadata columns + seed copy
-- Status: ACTIVE — run this to upgrade from Migration 004's empty site_content
--
-- Section numbering maps to page position (top = 1):
--   1  Hero 主视觉
--   2  滚动字幕        (no editable copy)
--   3  痛点区          (layout hardcoded; copy editable in future)
--   4  解决方案        (layout hardcoded; copy editable in future)
--   5  如何加入        (layout hardcoded; copy editable in future)
--   6  当期活动        (data from campaigns table, not site_content)
--   7  商家好评        ← editable here
--   8  FAQ             (data from faqs table, not site_content)
--   9  底部行动区      ← editable here
-- =============================================================================

-- Add metadata columns to existing site_content table
ALTER TABLE site_content
  ADD COLUMN IF NOT EXISTS section_name  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS section_order INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS field_label   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS field_type    TEXT NOT NULL DEFAULT 'text';

-- Seed all editable landing page fields
INSERT INTO site_content (key, value, section_name, section_order, field_label, field_type)
VALUES
  (
    'hero_headline',
    '20篇小红书帖子。\nRM 2,000。\n新顾客主动找上门。',
    'Hero 主视觉', 1,
    '主标题（3行，用换行分隔；第二行显示为红色）',
    'textarea'
  ),
  (
    'hero_sub',
    '5至8家商家共摊费用，同时激活20位签约博主。你的品牌出现在潜在顾客的搜索结果里——反复出现。',
    'Hero 主视觉', 1,
    '副标题',
    'textarea'
  ),
  (
    'hero_cta',
    '浏览当期活动榜单',
    'Hero 主视觉', 1,
    'CTA 按钮文案（Hero 按钮与页底按钮共用）',
    'text'
  ),
  (
    'testimonials',
    '[{"quote":"活动结束后第一个周末，就有三个新顾客说是在小红书找到我的。光是这样，就回本了。","name":"刘玥婷","biz":"Café 秘葉，Petaling Jaya","avatarUrl":"https://picsum.photos/seed/cafe-lady-pj-01/80/80"},{"quote":"之前花 RM 1,000 找博主，零新顾客。这次 20 篇上线后，我在小红书搜自己的店，终于能找到内容了。","name":"郑振翔","biz":"源记餐厅，Subang Jaya","avatarUrl":"https://picsum.photos/seed/resto-man-subang-02/80/80"}]',
    '商家好评', 7,
    '好评卡片（头像、引用语、姓名、店铺）',
    'testimonials'
  ),
  (
    'offer_bullets',
    '["20位签约博主覆盖（市场价值 RM 10,000–60,000）","全程执行：博主沟通、内容创作、质量审核、排期上线","榜单格式发布，天花板光环效应加持","明确发布时间表，不是模糊的“大概两周”"]',
    '底部行动区', 9,
    '价值承诺列表（勾选清单）',
    'list'
  )
ON CONFLICT (key) DO UPDATE SET
  section_name  = EXCLUDED.section_name,
  section_order = EXCLUDED.section_order,
  field_label   = EXCLUDED.field_label,
  field_type    = EXCLUDED.field_type,
  value         = EXCLUDED.value,
  updated_at    = NOW();


-- =============================================================================
-- MIGRATION 006 — site_content: full content editor fields + GTM field
-- Status: ACTIVE
--
-- Adds every field surfaced in /admin/content (all 8 sections).
-- Uses ON CONFLICT DO NOTHING so live admin edits are never overwritten.
-- The only exception is section metadata columns, which are always refreshed.
--
-- New fields vs Migration 005:
--   marquee_items, pain_*, solution_*, stats_bar, join_*, steps,
--   cta_heading, cta_sub  — wired up by previous session's content editor
--   gtm_id                — added this session for Google Tag Manager
-- =============================================================================

INSERT INTO site_content (key, value, section_name, section_order, field_label, field_type)
VALUES
  -- Analytics / GTM (Section 8)
  ('gtm_id', '', '分析与追踪', 8, 'GTM 容器 ID（格式：GTM-XXXXXXX）', 'text'),

  -- Marquee (Section 2)
  ('marquee_items',
   '["小红书榜单合集","20位签约博主","共享营销模式","搜索结果饱和","RM 2,000起","全程代执行","天花板光环效应","马来西亚首创"]',
   'Marquee 滚动字幕', 2, '滚动标签列表', 'list'),

  -- Pain section (Section 3)
  ('pain_eyebrow', '你是否曾经历这一幕', 'Pain 痛点区块', 3, '眉题小标签', 'text'),
  ('pain_headline', '你搜索过你所在\n区域的关键词吗？', 'Pain 痛点区块', 3, '大标题（可换行）', 'textarea'),
  ('pain_intro',
   '"SS15 咖啡馆推荐。"\n前排出来的，是那家你认识的店。不比你好的店。',
   'Pain 痛点区块', 3, '引导段（换行分句）', 'textarea'),
  ('pain_intro_highlight', '20 篇帖子，每一篇都在推荐它。',
   'Pain 痛点区块', 3, '引导段末尾强调句', 'text'),
  ('pain_points',
   '["你的店？一篇都没有。","你不是没有试过——花过 RM 800 找博主合作，来了三个粉丝，零新顾客。投过 Facebook 广告，没有人走进门。","问题不是你的店不够好。问题是：一两篇内容，根本无法在小红书搜索结果里形成存在感。"]',
   'Pain 痛点区块', 3, '痛点段落列表', 'list'),
  ('pain_closing_line1', '你的竞争对手不是比你好。', 'Pain 痛点区块', 3, '结语第一行', 'text'),
  ('pain_closing_line2', '他们只是在小红书比你占据了更多的版面。', 'Pain 痛点区块', 3, '结语第二行', 'text'),

  -- Solution section (Section 4)
  ('solution_intro',
   '红薯榜单不是帮你找一个博主。我们一次性激活 20 位签约博主，以榜单格式集中发布——"KL 最值得去的 8 家咖啡馆"——让你的品牌在搜索结果里密集出现。不是广告。是推荐。',
   'Solution 解决方案', 4, '介绍段落', 'textarea'),
  ('solution_sub', '你只需要提供照片和卖点，其余全部由我们包办。',
   'Solution 解决方案', 4, '补充说明（小字）', 'text'),

  -- Stats bar (Section 5 — sits inside Testimonials card)
  ('stats_bar',
   '[{"value":"20位","label":"签约博主 · 每期活动"},{"value":"RM 2,000","label":"vs 市场行情 RM 60,000"},{"value":"持续增长","label":"商家已完成活动"}]',
   '商家好评', 7, '数据展示栏（好评区块下方）', 'list'),

  -- How to Join (Section 6)
  ('join_heading', '如何加入', 'How to Join 加入流程', 6, '区块标题', 'text'),
  ('join_sub',    '三步，轻松上榜', 'How to Join 加入流程', 6, '副标题', 'text'),
  ('steps',
   '[{"head":"浏览当期活动","desc":"在活动页面找到最适合你品牌调性的主题榜单"},{"head":"提交素材","desc":"填写简单表格，即可锁定名额"},{"head":"坐等帖子上线","desc":"2 至 3 周内，20 篇博主帖子陆续发布。其余全部由我们负责"}]',
   'How to Join 加入流程', 6, '步骤列表', 'list'),

  -- Closing CTA (Section 9)
  ('cta_heading', '你的竞争对手已经在被推荐了。', 'Closing CTA 底部行动区', 9, '主标题', 'text'),
  ('cta_sub',     '你的名字，什么时候出现在榜单上？', 'Closing CTA 底部行动区', 9, '副标题（灰色小字）', 'text')

ON CONFLICT (key) DO NOTHING;

-- Refresh section metadata for all rows (harmless; does not touch value)
UPDATE site_content SET section_name = '分析与追踪',         section_order = 8  WHERE key = 'gtm_id';
UPDATE site_content SET section_name = 'Marquee 滚动字幕',   section_order = 2  WHERE key = 'marquee_items';
UPDATE site_content SET section_name = 'Pain 痛点区块',       section_order = 3  WHERE key IN ('pain_eyebrow','pain_headline','pain_intro','pain_intro_highlight','pain_points','pain_closing_line1','pain_closing_line2');
UPDATE site_content SET section_name = 'Solution 解决方案',   section_order = 4  WHERE key IN ('solution_intro','solution_sub');
UPDATE site_content SET section_name = 'How to Join 加入流程',section_order = 6  WHERE key IN ('join_heading','join_sub','steps');
UPDATE site_content SET section_name = 'Closing CTA 底部行动区', section_order = 9 WHERE key IN ('cta_heading','cta_sub');


-- =============================================================================
-- MIGRATION 007 — campaign_reports: per-campaign KOL data + report config
-- Status: ACTIVE
--
-- Stores the entire CampaignReportData JSON blob keyed by campaign_id.
-- Written by /admin/report/[id] and read by /report/[id]/view.
-- Data includes: KOL list (name, handle, images, milestones, 7/14/28-day stats)
--                + per-merchant report display config + ROI assumptions.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.campaign_reports (
  campaign_id  TEXT PRIMARY KEY,
  data         JSONB NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campaign_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON public.campaign_reports FOR ALL USING (true) WITH CHECK (true);
