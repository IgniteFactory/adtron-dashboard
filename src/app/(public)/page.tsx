"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, ArrowDown, Activity,
  Users, Zap, TrendingUp, Search,
  ChevronRight, ChevronLeft,
  Plus, Minus, CheckCircle, HelpCircle,
} from "lucide-react";
import { Campaign } from "@/lib/mockDb";
import { supabaseDb } from "@/lib/supabaseDb";
import { faqDb, FAQ } from "@/lib/faqDb";
import { siteContentDb, SiteContent, SITE_CONTENT_DEFAULTS } from "@/lib/siteContentDb";

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
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -48 : 48 }),
};
const testimonialVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 64 : -64 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -64 : 64 }),
};

const SOLUTION_CARDS = [
  {
    num: "01", wide: true,
    tag: "共享成本",
    head: "中小企业的预算，大品牌的火力",
    desc: "RM 2,000，获得原本需要 RM 10,000–60,000 才有的 20 篇博主覆盖。共摊费用，实打实的帖子。",
    Icon: Users,
  },
  {
    num: "02", wide: false,
    tag: "搜索饱和",
    head: "20篇帖子，搜索结果饱和",
    desc: "多关键词、多角度密集发布。潜在顾客搜索时，看到你不是一次，是好几次。",
    Icon: Search,
  },
  {
    num: "03", wide: false,
    tag: "榜单格式",
    head: "被推荐，不是在打广告",
    desc: "用户会认真看、截图收藏、主动分享——因为这是内容，不是品牌稿。",
    Icon: Zap,
  },
  {
    num: "04", wide: true,
    tag: "天花板光环",
    head: "与知名商家同框，可信度自然拉升",
    desc: "每期纳入同城知名商家。与已被信任的品牌同框，你的可信度不用自己说。",
    Icon: TrendingUp,
  },
];


const MOCK_RESULTS = [
  "PJ 必吃！8家隐藏咖啡馆本地人才知道",
  "SS15 最值得去的 6 家咖啡馆合集",
  "巴生河流域下午茶推荐，每家都去过",
  "2025 最新！雪隆区咖啡馆合集推荐",
];


export default function LandingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [[carouselPage, campaignDir], setCarouselPage] = useState([0, 0]);
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [homeFaqs, setHomeFaqs] = useState<FAQ[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent>(SITE_CONTENT_DEFAULTS);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [testimonialDir, setTestimonialDir] = useState(1);

  const joinRef = useRef<HTMLElement>(null);
  const explainerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const painRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);
  const blockquoteRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 4;

  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaSectionRef,
    offset: ["start end", "end start"],
  });
  const ctaCardY = useTransform(ctaProgress, [0, 1], [80, -80]);

  // Scroll-driven blockquote slide-in (follows scroll speed, reverses on scroll up)
  const { scrollYProgress: bqProgress } = useScroll({
    target: blockquoteRef,
    offset: ["start 0.85", "center 0.5"],
  });
  const bqLine1X = useTransform(bqProgress, [0, 0.65], [-80, 0]);
  const bqLine1Opacity = useTransform(bqProgress, [0, 0.45], [0, 1]);
  const bqLine2X = useTransform(bqProgress, [0.28, 1], [-80, 0]);
  const bqLine2Opacity = useTransform(bqProgress, [0.3, 0.75], [0, 1]);

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
    faqDb.getFaqsForDisplay().then(faqs => setHomeFaqs(faqs.slice(0, 4)));
    siteContentDb.getAll().then(setSiteContent);
  }, []);

  // Testimonial auto-advance
  useEffect(() => {
    if (siteContent.testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setTestimonialDir(1);
      setTestimonialIdx(i => (i + 1) % siteContent.testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [siteContent.testimonials.length]);

  const scrollToJoin = () =>
    joinRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToExplainer = () =>
    explainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current || !glowRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    glowRef.current.style.left = `${e.clientX - rect.left}px`;
    glowRef.current.style.top = `${e.clientY - rect.top}px`;
  };

  const goToTestimonial = (idx: number) => {
    setTestimonialDir(idx > testimonialIdx ? 1 : -1);
    setTestimonialIdx(idx);
  };
  const prevTestimonial = () => {
    const newIdx = (testimonialIdx - 1 + siteContent.testimonials.length) % siteContent.testimonials.length;
    setTestimonialDir(-1);
    setTestimonialIdx(newIdx);
  };
  const nextTestimonial = () => {
    const newIdx = (testimonialIdx + 1) % siteContent.testimonials.length;
    setTestimonialDir(1);
    setTestimonialIdx(newIdx);
  };

  return (
    <main className="overflow-x-hidden w-full max-w-full flex flex-col">

      {/* grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[60] opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
        aria-hidden
      />

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section
        ref={heroRef as React.RefObject<HTMLDivElement>}
        onMouseMove={handleHeroMouseMove}
        className="relative min-h-[calc(100dvh-5rem)] flex items-center px-4 py-12 overflow-hidden"
      >
        {/* Static ambient glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/4 left-[8%] w-[560px] h-[560px] rounded-full bg-brand/[0.07] blur-[110px]" />
          <div className="absolute bottom-1/3 right-[5%] w-[340px] h-[340px] rounded-full bg-brand/[0.04] blur-[90px]" />
        </div>

        {/* Mouse-follow glow */}
        <div
          ref={glowRef}
          className="absolute pointer-events-none"
          style={{
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(232,50,42,0.07) 0%, transparent 65%)",
            transform: "translate(-50%, -50%)",
            transition: "left 0.18s ease-out, top 0.18s ease-out",
            left: "50%",
            top: "50%",
          }}
          aria-hidden
        />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 xl:gap-24 items-center relative">

          <motion.div initial="hidden" animate="visible" variants={childStagger} className="max-w-2xl">
            <motion.div variants={fadeUp} className="mb-7">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse flex-shrink-0" />
                马来西亚首个共享式小红书营销平台
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl lg:text-[4.25rem] font-black tracking-tight leading-[1.05] text-white mb-6"
            >
              {siteContent.hero_headline.replace(/\\n/g, '\n').split('\n').map((line, i, arr) => (
                <span key={i}>
                  {i === 1 ? <span className="text-brand">{line}</span> : line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-[1.0625rem] text-text-secondary leading-relaxed mb-10 max-w-[46ch]">
              {siteContent.hero_sub}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start gap-4 mb-6">
              <Link
                href="/discover"
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-full bg-brand text-white font-bold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_28px_rgba(232,50,42,0.25)]"
              >
                {siteContent.hero_cta}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Link>
              <button
                onClick={() => painRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-full border border-white/[0.1] bg-white/[0.03] text-white font-medium text-sm transition-all duration-300 hover:bg-white/[0.07] cursor-pointer"
              >
                了解合作模式
                <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" strokeWidth={2} />
              </button>
            </motion.div>

            <motion.p variants={fadeUp} className="text-xs text-text-secondary tracking-wide">
              每期限 5–8 个名额 · 满额即止
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.28, ease }}
            className="hidden lg:block flex-shrink-0"
          >
            <div className="relative bg-bg-surface border border-white/[0.07] rounded-[2rem] p-5 shadow-[0_32px_72px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center gap-3 px-4 py-3 bg-bg-main rounded-2xl border border-white/[0.05] mb-5">
                <Search className="w-4 h-4 text-text-secondary flex-shrink-0" strokeWidth={1.8} />
                <span className="text-white/45 text-sm">SS15 咖啡馆推荐</span>
              </div>
              <p className="text-[11px] text-text-secondary mb-3 px-1 font-medium">搜索结果 · 183 篇笔记</p>
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
                      <img src={`https://picsum.photos/seed/hero${i}xhs/80/80`} alt="" className="w-full h-full object-cover opacity-75" />
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
              <motion.div
                initial={{ opacity: 0, scale: 0.82, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: 3 }}
                transition={{ delay: 1.1, duration: 0.5, type: "spring", stiffness: 220, damping: 16 }}
                className="absolute -top-4 -right-5 bg-brand text-white px-4 py-2 rounded-2xl font-black text-xs shadow-[0_8px_24px_rgba(232,50,42,0.35)]"
              >
                20篇笔记同时上榜
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ MARQUEE ══════════════════════ */}
      <div className="border-y border-white/[0.05] py-4 overflow-hidden" aria-hidden>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="flex gap-14 whitespace-nowrap will-change-transform"
        >
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-center gap-14 flex-shrink-0">
              {siteContent.marquee_items.map((t, i) => (
                <span key={i} className="text-sm font-medium text-text-secondary flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block flex-shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════ PAIN ══════════════════════ */}
      <section ref={painRef} className="py-32 px-4 bg-bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-16">

            {/* Left: all pain content scrolls normally */}
            <div className="self-start">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={childStagger} className="mb-16">
                <motion.p variants={fadeUp} className="text-brand text-xs font-bold tracking-[0.2em] uppercase mb-6">
                  {siteContent.pain_eyebrow}
                </motion.p>
                <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.08] mb-6">
                  {siteContent.pain_headline.split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))}
                </motion.h2>
                <motion.p variants={fadeUp} className="text-text-secondary text-lg leading-relaxed max-w-[42ch]">
                  {siteContent.pain_intro.split('\n').map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))}
                  {siteContent.pain_intro_highlight && (
                    <><br /><span className="text-white font-semibold">{siteContent.pain_intro_highlight}</span></>
                  )}
                </motion.p>
              </motion.div>

              <div className="max-w-2xl space-y-5 mb-16">
                {siteContent.pain_points.map((text, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease }}
                    className={`leading-relaxed ${i === 0 ? "text-xl font-bold text-white" : "text-text-secondary text-base"}`}
                  >
                    {text}
                  </motion.p>
                ))}
              </div>

              {/* Scroll-driven closing statement — slides with scroll, reverses on scroll up */}
              <div ref={blockquoteRef} className="pt-16 border-t border-white/[0.06]">
                <div className="border-l-[3px] border-brand pl-7 max-w-xl">
                  <motion.p
                    style={{ x: bqLine1X, opacity: bqLine1Opacity }}
                    className="text-2xl md:text-3xl font-bold italic text-white leading-snug mb-3"
                  >
                    {siteContent.pain_closing_line1}
                  </motion.p>
                  <motion.p
                    style={{ x: bqLine2X, opacity: bqLine2Opacity }}
                    className="text-lg md:text-xl italic text-text-secondary leading-relaxed"
                  >
                    {siteContent.pain_closing_line2}
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Right: widget slightly above center against left column */}
            <div className="hidden lg:block self-center">
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15, ease }}
                style={{ marginTop: '-35px' }}
              >
                <div className="bg-bg-main rounded-[1.5rem] border border-white/[0.07] p-5">
                  <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface rounded-xl border border-white/[0.05] mb-5">
                    <Search className="w-4 h-4 text-text-secondary flex-shrink-0" strokeWidth={2} />
                    <span className="text-white/50 text-sm">SS15 咖啡馆推荐</span>
                  </div>
                  <div className="p-5 rounded-xl bg-bg-surface border border-white/[0.06] mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-sm font-semibold">某同行咖啡馆</span>
                      <span className="text-[11px] font-bold text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-full">20 篇推荐</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, i) => <div key={i} className="h-1.5 flex-1 rounded-full bg-brand/50" />)}
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-bg-surface border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-text-secondary text-sm font-semibold">你的店</span>
                      <span className="text-[11px] font-bold text-text-secondary bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">未收录</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, i) => <div key={i} className="h-1.5 flex-1 rounded-full bg-white/[0.08]" />)}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════ SOLUTION ══════════════════════ */}
      <section ref={explainerRef as React.RefObject<HTMLDivElement>} id="what-is" className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-end mb-16">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }}>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                红薯榜单<br /><span className="text-brand">的做法</span>
              </h2>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1, ease }}>
              <p className="text-text-secondary leading-relaxed text-base mb-3">
                {siteContent.solution_intro}
              </p>
              <p className="text-text-secondary text-sm">{siteContent.solution_sub}</p>
              <button
                onClick={scrollToJoin}
                className="group inline-flex items-center gap-2 text-brand font-bold text-sm mt-5 transition-all duration-300 hover:gap-3 cursor-pointer"
              >
                了解如何加入
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 grid-flow-dense">
            {SOLUTION_CARDS.map((b, i) => {
              const Icon = b.Icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.6, ease }}
                  className={`group relative p-8 rounded-[2rem] bg-bg-surface border border-white/[0.055] hover:border-brand/20 transition-all duration-500 overflow-hidden ${b.wide ? "md:col-span-3" : "md:col-span-2"}`}
                >
                  <div className="absolute -top-8 -right-3 text-[9rem] font-black leading-none select-none tracking-tighter text-white/[0.022] group-hover:text-brand/[0.04] transition-colors duration-700">{b.num}</div>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/18 flex items-center justify-center mb-6">
                      <Icon className="w-5 h-5 text-brand" strokeWidth={1.6} />
                    </div>
                    <span className="text-[11px] font-bold text-brand tracking-widest uppercase mb-3 inline-block">{b.tag}</span>
                    <h3 className="text-xl md:text-2xl font-black text-white mb-4 leading-tight">{b.head}</h3>
                    <p className="text-text-secondary leading-relaxed text-sm md:text-[0.9375rem]">{b.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CAMPAIGNS ══════════════════════ */}
      <section className="py-32 px-4 bg-bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={childStagger}>
              <motion.p variants={fadeUp} className="text-brand text-xs font-bold tracking-[0.2em] uppercase mb-3">
                当期活动
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight text-white">
                火热招募中
              </motion.h2>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Link href="/discover" className="group text-sm font-bold text-brand flex items-center gap-1 transition-all duration-300 hover:gap-1.5">
                查看更多 <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Link>
            </motion.div>
          </div>

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
            const currentCampaigns = campaigns.slice(carouselPage * ITEMS_PER_PAGE, (carouselPage + 1) * ITEMS_PER_PAGE);
            return (
              <div>
                <div className="relative overflow-hidden">
                  <AnimatePresence mode="wait" custom={campaignDir}>
                    <motion.div
                      key={carouselPage}
                      custom={campaignDir}
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
                          <article key={camp.id} className="group relative flex flex-col bg-bg-main rounded-[2rem] overflow-hidden border border-white/[0.055] hover:border-white/[0.11] transition-all duration-500">
                            <Link href={`/campaign/${camp.id}`} className="relative h-52 block overflow-hidden flex-shrink-0">
                              <img src={camp.image} alt={camp.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                              <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/20 to-transparent" />
                              <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs font-medium text-white border border-white/10">{camp.category}</span>
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
                                <h3 className="text-lg font-black text-white mb-2 line-clamp-2 leading-snug group-hover:text-brand transition-colors duration-300">{camp.title}</h3>
                                <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed mb-5">{camp.description}</p>
                              </Link>
                              <div className="mt-auto">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-text-secondary">{total} / {camp.targetSlots} 席位</span>
                                  <span className="text-xs font-mono font-bold text-brand">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/35 rounded-full overflow-hidden mb-5">
                                  <div className="h-full rounded-full bg-brand transition-all duration-1000" style={{ width: `${progress}%` }} />
                                </div>
                                <Link
                                  href={`/campaign/${camp.id}`}
                                  className="group/btn w-full py-3 rounded-xl flex items-center justify-center font-bold text-sm border border-white/[0.07] text-white hover:bg-brand hover:text-white hover:border-transparent transition-all duration-300"
                                >
                                  了解并加入榜单
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
                    <button onClick={() => paginate(carouselPage - 1)} disabled={carouselPage === 0} className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer">
                      <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-2.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button key={i} onClick={() => paginate(i)} className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === carouselPage ? "w-8 bg-brand" : "w-2 bg-white/20 hover:bg-white/40"}`} />
                      ))}
                    </div>
                    <button onClick={() => paginate(carouselPage + 1)} disabled={carouselPage === totalPages - 1} className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer">
                      <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease }}
                  className="mt-14 flex justify-center"
                >
                  <Link
                    href="/discover"
                    className="group inline-flex items-center gap-2.5 h-13 px-8 rounded-full bg-brand text-white font-bold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_28px_rgba(232,50,42,0.25)]"
                  >
                    浏览全部活动榜单
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
                  </Link>
                </motion.div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }} className="mb-16">
            <p className="text-brand text-xs font-bold tracking-[0.2em] uppercase mb-4">商家真实反馈</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">他们说什么</h2>
          </motion.div>

          {/* Testimonial Carousel */}
          <div className="relative mb-8 overflow-hidden">
            <AnimatePresence mode="wait" custom={testimonialDir}>
              {siteContent.testimonials[testimonialIdx] && (
                <motion.div
                  key={testimonialIdx}
                  custom={testimonialDir}
                  variants={testimonialVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.42, ease }}
                  className="bg-bg-surface rounded-[2rem] border border-white/[0.055] p-10 md:p-14"
                >
                  <div className="text-8xl font-black text-brand/15 leading-none mb-6 select-none">"</div>
                  <p className="text-white leading-relaxed text-xl md:text-2xl mb-10 max-w-3xl">
                    {siteContent.testimonials[testimonialIdx].quote}
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <img
                      src={siteContent.testimonials[testimonialIdx].avatarUrl}
                      alt={siteContent.testimonials[testimonialIdx].name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{siteContent.testimonials[testimonialIdx].name}</p>
                      <p className="text-text-secondary text-sm">{siteContent.testimonials[testimonialIdx].biz}</p>
                    </div>
                    <span className="text-[10px] font-bold text-brand/70 bg-brand/10 border border-brand/15 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                      已完成活动
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex gap-2">
              {siteContent.testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToTestimonial(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${i === testimonialIdx ? "w-8 bg-brand" : "w-2 bg-white/20 hover:bg-white/40"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] transition-all duration-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <button
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.07] transition-all duration-200 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06] bg-bg-surface rounded-[1.5rem] border border-white/[0.06] overflow-hidden"
          >
            {siteContent.stats_bar.map((stat, i) => (
              <div key={i} className="px-8 py-7 text-center">
                <p className="text-3xl font-black text-white tracking-tight mb-1.5">{stat.value}</p>
                <p className="text-text-secondary text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ HOW TO JOIN ══════════════════════ */}
      <section ref={joinRef as React.RefObject<HTMLDivElement>} id="how-to-join" className="py-32 px-4 bg-bg-surface">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={childStagger} className="mb-20">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">{siteContent.join_heading}</motion.h2>
            <motion.p variants={fadeUp} className="text-text-secondary text-lg">{siteContent.join_sub}</motion.p>
          </motion.div>

          <div className="flex flex-col md:hidden gap-8 mb-16">
            {siteContent.steps.map((s, i) => (
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

          <div className="hidden md:flex gap-3 mb-16 h-80">
            {siteContent.steps.map((s, i) => {
              const isActive = activeStep === i;
              return (
                <motion.div
                  key={i}
                  onMouseEnter={() => setActiveStep(i)}
                  animate={{ flex: isActive ? 4 : 1 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative overflow-hidden rounded-[2rem] border cursor-pointer transition-colors duration-500 ${isActive ? "border-brand/25 bg-bg-main" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10]"}`}
                >
                  <motion.div animate={{ opacity: isActive ? 1 : 0 }} transition={{ duration: 0.5 }} className="absolute -bottom-16 -left-10 w-56 h-56 rounded-full bg-brand/[0.08] blur-3xl pointer-events-none" />
                  <div className={`absolute top-7 left-7 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isActive ? "border-brand/45 bg-brand/[0.12]" : "border-white/[0.12]"}`}>
                    <span className={`font-black text-lg leading-none transition-colors duration-500 ${isActive ? "text-brand" : "text-white/30"}`}>{i + 1}</span>
                  </div>
                  <div className="absolute top-5 right-6 text-right select-none pointer-events-none">
                    <div className="text-[10px] font-bold tracking-[0.22em] uppercase text-white/[0.13]">Step</div>
                    <div className="text-[5.5rem] font-black leading-none text-white/[0.07] -mt-1" style={{ textShadow: "0 8px 28px rgba(0,0,0,0.55)" }}>{i + 1}</div>
                  </div>
                  <motion.div animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 14 }} transition={{ duration: 0.32, delay: isActive ? 0.22 : 0 }} className="absolute bottom-7 left-7 right-7 pointer-events-none">
                    <h3 className="text-white font-black text-xl mb-3 leading-snug">{s.head}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
                  </motion.div>
                  <motion.div animate={{ opacity: isActive ? 0 : 1 }} transition={{ duration: 0.2 }} className="absolute bottom-7 left-0 right-0 flex justify-center">
                    <span className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase whitespace-nowrap" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Step {i + 1}</span>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease }}>
            <Link
              href="/discover"
              className="group inline-flex items-center gap-2 h-12 px-7 rounded-full bg-brand text-white font-bold text-sm transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_28px_rgba(232,50,42,0.25)]"
            >
              浏览当期活动榜单
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ FAQ ══════════════════════ */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-brand" strokeWidth={1.6} />
                </div>
                <span className="text-brand text-xs font-bold tracking-[0.2em] uppercase">常见问题</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">您可能想知道的</h2>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Link href="/faq" className="group inline-flex items-center gap-2 text-sm font-bold text-brand transition-all duration-300 hover:gap-3">
                查看全部问题 <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
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
                  <button onClick={() => setOpenFaq(isOpen ? null : faq.id)} className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none cursor-pointer">
                    <span className="text-base font-semibold text-white pr-4">{faq.question}</span>
                    <span className="text-brand shrink-0">{isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}</span>
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

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3, ease }} className="mt-12 text-center">
            <Link href="/faq" className="group inline-flex items-center gap-2 h-12 px-7 rounded-full border border-brand/30 text-brand font-bold text-sm transition-all duration-300 hover:bg-brand hover:text-white">
              查看所有常见问题
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ CLOSING CTA ══════════════════════ */}
      <section ref={ctaSectionRef} className="py-32 px-4 bg-bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16 items-start">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={childStagger}>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.1] mb-10">
                {siteContent.cta_heading}
                <span className="block text-text-secondary font-semibold text-3xl md:text-4xl mt-3">
                  {siteContent.cta_sub}
                </span>
              </motion.h2>

              <motion.div variants={fadeUp} className="space-y-3.5 mb-10">
                {siteContent.offer_bullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-text-secondary text-sm leading-relaxed">{bullet}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp}>
                <Link
                  href="/discover"
                  className="group inline-flex items-center gap-2.5 h-14 px-8 rounded-full bg-brand text-white font-black text-base transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_36px_rgba(232,50,42,0.28)]"
                >
                  {siteContent.hero_cta}
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
                </Link>
              </motion.div>

              <motion.p variants={fadeUp} className="text-xs text-text-secondary mt-5 tracking-wide">
                本期名额剩余有限 · 满额即止 · 下一期不保证同等条件
              </motion.p>
            </motion.div>

            {/* Parallax wrapper — moves at a different rate to the page scroll */}
            <motion.div style={{ y: ctaCardY }} className="lg:self-start">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-[2rem] bg-brand/[0.06] blur-2xl" aria-hidden />
                <div className="relative bg-bg-main border border-white/[0.08] rounded-[2rem] p-8 lg:min-w-[280px] text-center">
                  <p className="text-text-secondary text-sm mb-2">全包价格</p>
                  <p className="text-5xl font-black text-white tracking-tight mb-1">RM 2,000</p>
                  <p className="text-text-secondary text-xs mb-6">/ 名额</p>
                  <div className="h-px bg-white/[0.06] mb-6" />
                  <p className="text-xs text-text-secondary mb-1">市场同等服务</p>
                  <p className="text-2xl font-black text-white/25 line-through tracking-tight mb-1">RM 60,000</p>
                  <p className="text-[10px] text-text-secondary">高端网红营销行情</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="border-t border-white/[0.06] bg-bg-main px-4 pt-16 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 mb-12">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Zap className="w-5 h-5 text-brand fill-brand flex-shrink-0" />
                <span className="font-black text-xl text-white tracking-tight">红薯榜单</span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed max-w-[32ch] mb-6">
                马来西亚首个共享式小红书营销平台。让中小商家以合理预算，获得大品牌级别的搜索曝光。
              </p>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse flex-shrink-0" />
                当期活动招募中
              </span>
            </div>

            {/* Platform links */}
            <div>
              <p className="text-white font-bold text-sm mb-5 tracking-wide">平台</p>
              <ul className="space-y-3.5">
                <li>
                  <Link href="/discover" className="text-text-secondary text-sm hover:text-white transition-colors duration-200">
                    浏览活动
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-text-secondary text-sm hover:text-white transition-colors duration-200">
                    常见问题
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-text-secondary text-sm hover:text-white transition-colors duration-200">
                    商家登入
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-text-secondary text-sm hover:text-white transition-colors duration-200">
                    注册入驻
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Legal */}
            <div>
              <p className="text-white font-bold text-sm mb-5 tracking-wide">联系我们</p>
              <ul className="space-y-3.5 mb-8">
                <li>
                  <a href="mailto:hello@redlist.my" className="text-text-secondary text-sm hover:text-white transition-colors duration-200">
                    hello@redlist.my
                  </a>
                </li>
                <li>
                  <span className="text-text-secondary text-sm">Kuala Lumpur, Malaysia</span>
                </li>
              </ul>
              <p className="text-white font-bold text-sm mb-4 tracking-wide">法律</p>
              <ul className="space-y-3">
                <li><span className="text-text-secondary text-sm cursor-default">隐私政策</span></li>
                <li><span className="text-text-secondary text-sm cursor-default">服务条款</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-text-secondary text-xs">
              © 2025 红薯榜单 · Adtron Sdn Bhd · 版权所有
            </p>
            <p className="text-text-secondary text-xs">
              Made in Malaysia
            </p>
          </div>
        </div>
      </footer>

    </main>
  );
}
