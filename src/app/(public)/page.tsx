"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowDown, Activity,
  Users, Zap, TrendingUp, Target, ChevronRight, ChevronLeft, Search,
  Plus, Minus, HelpCircle,
} from "lucide-react";
import { Campaign } from "@/lib/mockDb";
import { supabaseDb } from "@/lib/supabaseDb";
import { faqDb, FAQ } from "@/lib/faqDb";

/* ─────────────────────────── motion presets ─────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const childStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
};

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir: number) => ({ opacity: 0, x: dir >= 0 ? -48 : 48 }),
};

/* ─────────────────────────── data ────────────────────────────────────── */
const BENEFITS = [
  {
    num: "01", wide: true,
    tag: "极致性价比",
    head: "花一笔钱，享多重曝光",
    desc: "就像「团购」商品，我们「团购」博主。您和志同道合的商家共同分摊20位博主的费用，将预算效益最大化。",
    Icon: Users,
  },
  {
    num: "02", wide: false,
    tag: "霸屏级曝光",
    head: "矩阵式曝光，强势刷屏",
    desc: "一次合作，您的品牌同时出现在20位博主的内容池中，触达20个不同圈层。高频次、多角度重复提及，迅速建立熟悉感。",
    Icon: Zap,
  },
  {
    num: "03", wide: false,
    tag: "小红书算法加持",
    head: "引爆流量密码",
    desc: "清单类内容是小红书公认的流量密码，天然拥有极高的收藏与转发率，有效提升笔记权重，冲入更大的官方流量池。",
    Icon: TrendingUp,
  },
  {
    num: "04", wide: true,
    tag: "玩转小红书 SEO",
    head: "搜索结果，全面制霸",
    desc: "当用户搜索「KL最好吃的肉骨茶」，前排20篇榜单里都有您的店。榜单内商家还能「互蹭热度」，布局长期免费的自然流量入口。",
    Icon: Target,
  },
];

const STEPS = [
  {
    head: "浏览活动榜单",
    desc: "在活动页面，寻找最符合您品牌调性的主题榜单",
  },
  {
    head: "提交申请资料",
    desc: "点击进入详情页，确认后填写简单的申请表格即可锁定名额",
  },
  {
    head: "坐等品牌曝光",
    desc: "我们的团队会主动联系您对接后续素材，然后您就可以坐等20篇笔记引爆全网",
  },
];

const MOCK_RESULTS = [
  "巴生8家肉骨茶天花板，本地人才知道",
  "必吃！10家让人魂牵梦绕的肉骨茶",
  "雪隆区最好的N家肉骨茶合集推荐",
  "KL隐藏版肉骨茶，每家都有惊喜",
];

const MARQUEE_ITEMS = [
  "小红书合集帖", "20位博主矩阵", "拼单营销", "霸屏曝光",
  "SEO制霸", "RM2,000起", "本地商家首选", "小红书算法加持",
];

/* ─────────────────────────── page ────────────────────────────────────── */
export default function LandingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [[carouselPage, direction], setCarouselPage] = useState([0, 0]);
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [homeFaqs, setHomeFaqs] = useState<FAQ[]>([]);
  const joinRef = useRef<HTMLElement>(null);
  const explainerRef = useRef<HTMLElement>(null);

  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    supabaseDb.getCampaigns().then(data => {
      const sorted = data
        .filter(c => c.status !== "completed")
        .sort((a, b) => {
          const pctA = (a.realFilledSlots + a.manualBoost) / (a.targetSlots || 1);
          const pctB = (b.realFilledSlots + b.manualBoost) / (b.targetSlots || 1);
          return pctB - pctA;
        })
        .slice(0, 12);
      setCampaigns(sorted);
      setLoading(false);
    });

    // Load FAQs with display status true for homepage (show first 4)
    const displayed = faqDb.getFaqsForDisplay().slice(0, 4);
    setHomeFaqs(displayed);
  }, []);

  const scrollToJoin = () =>
    joinRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const scrollToExplainer = () =>
    explainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="overflow-x-hidden w-full max-w-full flex flex-col">

      {/* ═══════════════════════════ HERO ════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center px-4 py-24">

        {/* ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute top-1/4 left-[10%] w-[640px] h-[640px] rounded-full bg-brand/[0.055] blur-[110px]" />
          <div className="absolute bottom-1/4 right-[5%]  w-[400px] h-[400px] rounded-full bg-brand/[0.03]  blur-[90px]" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 xl:gap-24 items-center">

          {/* ── copy ── */}
          <motion.div
            initial="hidden" animate="visible" variants={childStagger}
            className="max-w-2xl"
          >
            <motion.p variants={fadeUp} className="text-brand text-xs font-bold tracking-[0.2em] uppercase mb-6">
              首创小红书拼单营销模式
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl lg:text-[4.25rem] font-black tracking-tight leading-[1.06] text-white mb-8"
            >
              告别天价预算<br />
              拼单享受<br />
              <span className="text-brand">20人博主矩阵</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-text-secondary leading-relaxed mb-10 max-w-[44ch]">
              只需 <span className="text-white font-semibold">RM 2,000</span>，即可享受以往大品牌才能拥有的
              20人博主矩阵推广。告别繁琐对接，轻松上榜。
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/discover"
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-full bg-brand text-bg-main font-bold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_32px_rgba(198,248,36,0.18)]"
              >
                浏览活动榜单
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Link>
              <button
                onClick={scrollToExplainer}
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-full border border-white/10 bg-white/[0.03] text-white font-medium text-sm transition-all duration-300 hover:bg-white/[0.07] cursor-pointer"
              >
                了解合作模式
                <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" strokeWidth={2} />
              </button>
            </motion.div>
          </motion.div>

          {/* ── hero visual: search mock ── */}
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease }}
            className="hidden lg:block flex-shrink-0"
          >
            <div className="relative bg-bg-surface border border-white/[0.07] rounded-[2rem] p-5 shadow-[0_32px_72px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">

              {/* search bar */}
              <div className="flex items-center gap-3 px-4 py-3 bg-bg-main rounded-2xl border border-white/[0.05] mb-5">
                <Search className="w-4 h-4 text-text-secondary flex-shrink-0" strokeWidth={1.8} />
                <span className="text-white/45 text-sm">巴生肉骨茶推荐</span>
              </div>

              <p className="text-[11px] text-text-secondary mb-3 px-1 font-medium">搜索结果 · 247 篇笔记</p>

              <div className="space-y-2.5">
                {MOCK_RESULTS.map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.11, duration: 0.5, ease }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-main border border-white/[0.05]"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={`https://picsum.photos/seed/bak${i}kut/80/80`}
                        alt=""
                        className="w-full h-full object-cover opacity-75"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium line-clamp-1 mb-1 leading-snug">{text}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand/15 border border-brand/20">
                        <span className="text-brand text-[10px] font-bold">您的品牌上榜</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <p className="mt-3 text-center text-[11px] text-text-secondary py-2.5 border-t border-white/[0.05]">
                还有 16 篇笔记 · 均包含您的品牌
              </p>

              {/* floating label */}
              <motion.div
                initial={{ opacity: 0, scale: 0.82, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 3 }}
                transition={{ delay: 1.1, duration: 0.5, type: "spring", stiffness: 220, damping: 16 }}
                className="absolute -top-4 -right-5 bg-brand text-bg-main px-4 py-2 rounded-2xl font-black text-xs shadow-[0_8px_24px_rgba(198,248,36,0.28)]"
              >
                20篇笔记同时上榜
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ════════════════════════ MARQUEE ════════════════════════════ */}
      <div className="border-y border-white/[0.05] py-4 overflow-hidden" aria-hidden>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex gap-14 whitespace-nowrap will-change-transform"
        >
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-center gap-14 flex-shrink-0">
              {MARQUEE_ITEMS.map((t, i) => (
                <span key={i} className="text-sm font-medium text-text-secondary flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block flex-shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ═══════════════════════ EXPLAINER ═══════════════════════════ */}
      <section ref={explainerRef as React.RefObject<HTMLDivElement>} id="what-is" className="py-32 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-20 items-start">

          {/* sticky heading */}
          <div className="lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
            >
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight mb-8">
                什么是<br />
                <span className="text-brand">红薯榜单？</span>
              </h2>
              <button
                onClick={scrollToJoin}
                className="group inline-flex items-center gap-2 text-brand font-bold text-sm transition-all duration-300 hover:gap-3 cursor-pointer"
              >
                轻松了解合作模式
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </button>
            </motion.div>
          </div>

          {/* right: text blocks */}
          <div className="space-y-10">
            {[
              {
                head: "红薯榜单就是一个让商家们可以「拼单」的营销平台",
                body: "红薯榜单就是一个让商家们可以「拼单」小红书营销费用的平台。我们聚集数位志同道合的商家，共同分摊20位博主的营销费用，以「团购」模式，让中小商家也能享受到霸屏级的品牌曝光，打造小红书上最受欢迎的内容格式——「合集帖」(Listicle)。",
              },
              {
                head: "「吉隆坡N个带娃周末好去处」「N家巴生人都点赞的肉骨茶天花板」",
                body: "我们的核心策略，是抢占小红书的搜索流量。一位用户想吃肉骨茶，在小红书上搜索「巴生肉骨茶推荐」。结果，前排刷出来的20篇不同「必吃榜单」里，每一篇都有您的店！",
              },
              {
                head: "霸屏式集体推荐，建立品牌信任",
                body: "这种「霸屏式」的集体推荐，会瞬间建立起用户的信任感，让您的品牌成为那个「看来不去不行」的首选。",
              },
            ].map((block, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.09, ease }}
                className="border-l-2 border-white/[0.08] pl-8 hover:border-brand/35 transition-colors duration-500"
              >
                <h3 className="text-white font-bold text-base md:text-lg mb-3 leading-snug">{block.head}</h3>
                <p className="text-text-secondary leading-relaxed">{block.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ BENEFITS BENTO ═════════════════════════ */}
      <section className="py-32 px-4 bg-bg-surface">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="text-4xl md:text-5xl font-black tracking-tight text-white mb-16"
          >
            四大核心优势
          </motion.h2>

          {/* Bento: 5-col, gapless via grid-flow-dense */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 grid-flow-dense">
            {BENEFITS.map((b, i) => {
              const Icon = b.Icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.6, ease }}
                  className={`group relative p-8 rounded-[2rem] bg-bg-main border border-white/[0.055] hover:border-brand/18 transition-all duration-500 overflow-hidden ${
                    b.wide ? "md:col-span-3" : "md:col-span-2"
                  }`}
                >
                  {/* decorative number */}
                  <div className="absolute -top-8 -right-3 text-[9rem] font-black leading-none select-none tracking-tighter text-white/[0.022] group-hover:text-brand/[0.04] transition-colors duration-700">
                    {b.num}
                  </div>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/18 flex items-center justify-center mb-6">
                      <Icon className="w-5 h-5 text-brand" strokeWidth={1.6} />
                    </div>
                    <span className="text-[11px] font-bold text-brand tracking-widest uppercase mb-3 inline-block">
                      {b.tag}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white mb-4 leading-tight">{b.head}</h3>
                    <p className="text-text-secondary leading-relaxed text-sm md:text-[0.9375rem]">{b.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW TO JOIN ═════════════════════════ */}
      <section
        ref={joinRef as React.RefObject<HTMLDivElement>}
        id="how-to-join"
        className="py-32 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={childStagger}
            className="mb-20"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">
              如何加入
            </motion.h2>
            <motion.p variants={fadeUp} className="text-text-secondary text-lg">三步，轻松上榜</motion.p>
          </motion.div>

          {/* Mobile */}
          <div className="flex flex-col md:hidden gap-8 mb-16">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-full border-2 border-brand/35 bg-bg-main flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand font-black text-lg leading-none">{i + 1}</span>
                </div>
                <div>
                  <h3 className="text-white font-black text-lg mb-2">{s.head}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop accordion */}
          <div className="hidden md:flex gap-3 mb-16 h-80">
            {STEPS.map((s, i) => {
              const isActive = activeStep === i;
              return (
                <motion.div
                  key={i}
                  onMouseEnter={() => setActiveStep(i)}
                  animate={{ flex: isActive ? 4 : 1 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative overflow-hidden rounded-[2rem] border cursor-pointer transition-colors duration-500 ${
                    isActive
                      ? "border-brand/25 bg-bg-surface"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10]"
                  }`}
                >
                  <motion.div
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-brand/[0.08] blur-3xl pointer-events-none"
                  />

                  <div className={`absolute top-7 left-7 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                    isActive ? "border-brand/45 bg-brand/[0.12]" : "border-white/[0.12]"
                  }`}>
                    <span className={`font-black text-lg leading-none transition-colors duration-500 ${
                      isActive ? "text-brand" : "text-white/30"
                    }`}>{i + 1}</span>
                  </div>

                  <div className="absolute top-5 right-6 text-right select-none pointer-events-none">
                    <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/[0.13]">Step</div>
                    <div
                      className="text-[5.5rem] font-black leading-none text-white/[0.07] -mt-1"
                      style={{ textShadow: "0 8px 28px rgba(0,0,0,0.55)" }}
                    >
                      {i + 1}
                    </div>
                  </div>

                  <motion.div
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 14 }}
                    transition={{ duration: 0.32, delay: isActive ? 0.22 : 0 }}
                    className="absolute bottom-7 left-7 right-7 pointer-events-none"
                  >
                    <h3 className="text-white font-black text-xl mb-3 leading-snug">{s.head}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
                  </motion.div>

                  <motion.div
                    animate={{ opacity: isActive ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-7 left-0 right-0 flex justify-center"
                  >
                    <span
                      className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase whitespace-nowrap"
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    >
                      Step {i + 1}
                    </span>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <Link
              href="/discover"
              className="group inline-flex items-center gap-2 h-12 px-7 rounded-full bg-brand text-bg-main font-bold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_28px_rgba(198,248,36,0.16)]"
            >
              点击浏览活动榜单
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ FEATURED CAMPAIGNS ═════════════════════ */}
      <section className="py-32 px-4 bg-bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="text-4xl md:text-5xl font-black tracking-tight text-white"
            >
              火热招募中
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/discover" className="group text-sm font-bold text-brand flex items-center gap-1 transition-all duration-300 hover:gap-1.5">
                查看更多
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Link>
            </motion.div>
          </div>

          {/* skeleton loaders */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-[2rem] bg-bg-main border border-white/[0.05] overflow-hidden">
                  <div className="h-52 bg-white/[0.04] animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-white/[0.04] rounded-full animate-pulse w-3/4" />
                    <div className="h-3 bg-white/[0.04] rounded-full animate-pulse" />
                    <div className="h-3 bg-white/[0.04] rounded-full animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && campaigns.length === 0 && (
            <p className="text-center py-20 text-text-secondary">暂无进行中的活动。</p>
          )}

          {!loading && campaigns.length > 0 && (() => {
            const totalPages = Math.ceil(campaigns.length / ITEMS_PER_PAGE);
            const paginate = (newPage: number) => {
              if (newPage < 0 || newPage >= totalPages) return;
              setCarouselPage([newPage, newPage > carouselPage ? 1 : -1]);
            };
            const currentCampaigns = campaigns.slice(
              carouselPage * ITEMS_PER_PAGE,
              (carouselPage + 1) * ITEMS_PER_PAGE
            );

            return (
              <div>
                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={carouselPage}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.38, ease }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      {currentCampaigns.map((camp) => {
                        const total = camp.realFilledSlots + camp.manualBoost;
                        const progress = Math.min(100, (total / camp.targetSlots) * 100);
                        const isFull = total >= camp.targetSlots;

                        return (
                          <article
                            key={camp.id}
                            className="group relative flex flex-col bg-bg-main rounded-[2rem] overflow-hidden border border-white/[0.055] hover:border-white/[0.11] transition-all duration-500"
                          >
                            <Link href={`/campaign/${camp.id}`} className="relative h-52 block overflow-hidden flex-shrink-0">
                              <img
                                src={camp.image}
                                alt={camp.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/20 to-transparent" />
                              <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs font-medium text-white border border-white/10">
                                  {camp.category}
                                </span>
                              </div>
                              {!isFull && (
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/18 backdrop-blur-sm border border-brand/22 text-brand text-xs font-bold">
                                  <Activity className="w-3 h-3 animate-pulse" strokeWidth={2} />
                                  招募中
                                </div>
                              )}
                            </Link>

                            <div className="p-6 flex flex-col flex-1">
                              <Link href={`/campaign/${camp.id}`} className="block flex-1">
                                <h3 className="text-lg font-black text-white mb-2 line-clamp-2 leading-snug group-hover:text-brand transition-colors duration-300">
                                  {camp.title}
                                </h3>
                                <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed mb-5">
                                  {camp.description}
                                </p>
                              </Link>

                              <div className="mt-auto">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-text-secondary">{total} / {camp.targetSlots} 席位</span>
                                  <span className="text-xs font-mono font-bold text-brand">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/35 rounded-full overflow-hidden mb-5">
                                  <div
                                    className="h-full rounded-full bg-brand transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <Link
                                  href={`/campaign/${camp.id}`}
                                  className="group/btn w-full py-3 rounded-xl flex items-center justify-center font-bold text-sm border border-white/[0.07] text-white hover:bg-brand hover:text-bg-main hover:border-transparent transition-all duration-300"
                                >
                                  抢占席位
                                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/btn:translate-x-0.5" strokeWidth={2.5} />
                                </Link>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-5 mt-12">
                    <button
                      onClick={() => paginate(carouselPage - 1)}
                      disabled={carouselPage === 0}
                      className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                    </button>

                    <div className="flex items-center gap-2.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => paginate(i)}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            i === carouselPage
                              ? "w-8 bg-brand"
                              : "w-2 bg-white/20 hover:bg-white/40"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => paginate(carouselPage + 1)}
                      disabled={carouselPage === totalPages - 1}
                      className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ══════════════════════ HOME FAQ SECTION ═════════════════════ */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-brand" strokeWidth={1.6} />
                </div>
                <span className="text-brand text-xs font-bold tracking-[0.2em] uppercase">常见问题</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                您可能想知道的
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                href="/faq"
                className="group inline-flex items-center gap-2 text-sm font-bold text-brand transition-all duration-300 hover:gap-3"
              >
                查看全部问题
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Link>
            </motion.div>
          </div>

          <div className="space-y-4">
            {homeFaqs.map((faq, index) => {
              const isOpen = openFaq === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.07, ease }}
                  className={`border border-white/[0.07] rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? "bg-white/[0.04]" : "bg-transparent hover:bg-white/[0.02]"}`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                  >
                    <span className="text-base font-semibold text-white pr-4">{faq.question}</span>
                    <span className="text-brand shrink-0">
                      {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        className="px-6 pb-6 text-text-secondary leading-relaxed whitespace-pre-line"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="mt-12 text-center"
          >
            <Link
              href="/faq"
              className="group inline-flex items-center gap-2 h-12 px-7 rounded-full border border-brand/30 text-brand font-bold text-sm transition-all duration-300 hover:bg-brand hover:text-bg-main"
            >
              查看所有常见问题
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
