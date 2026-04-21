"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { faqDb, FAQ, FAQ_CATEGORIES, FaqCategory } from "@/lib/faqDb";

const ease = [0.16, 1, 0.3, 1] as const;

const CATEGORY_ICONS: Record<FaqCategory, string> = {
  "关于红薯榜单": "🍠",
  "合作模式与流程": "🤝",
  "博主与内容": "✍️",
  "费用与支付": "💰",
  "效果与报告": "📊",
};

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "全部">("全部");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    setFaqs(faqDb.getFaqs());
  }, []);

  const filtered =
    activeCategory === "全部"
      ? faqs
      : faqs.filter((f) => f.category === activeCategory);

  const categories: Array<FaqCategory | "全部"> = ["全部", ...FAQ_CATEGORIES];

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-brand" strokeWidth={1.6} />
          </div>
          <span className="text-brand text-xs font-bold tracking-[0.2em] uppercase">FAQ</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
          常见问题
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          找到您关于红薯榜单合作模式的所有答案。若还有其他疑问，欢迎随时联系我们。
        </p>
      </motion.div>

      {/* Category filter cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const count =
            cat === "全部"
              ? faqs.length
              : faqs.filter((f) => f.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenFaq(null);
              }}
              className={`flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                isActive
                  ? "border-brand/40 bg-brand/[0.08]"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]"
              }`}
            >
              {cat !== "全部" && (
                <span className="text-xl">{CATEGORY_ICONS[cat as FaqCategory]}</span>
              )}
              {cat === "全部" && (
                <span className="text-xl">📋</span>
              )}
              <div>
                <p className={`text-xs font-bold leading-snug mb-1 ${isActive ? "text-brand" : "text-white"}`}>
                  {cat}
                </p>
                <p className="text-[11px] text-text-secondary">{count} 个问题</p>
              </div>
            </button>
          );
        })}
      </motion.div>

      {/* FAQ list */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
            className="space-y-4"
          >
            {filtered.length === 0 && (
              <p className="text-center text-text-secondary py-16">该分类暂无问题。</p>
            )}

            {filtered.map((faq, index) => {
              const isOpen = openFaq === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.04, ease }}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? "border-brand/20 bg-white/[0.04]"
                      : "border-white/[0.07] bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-brand/70 tracking-wider uppercase mb-1 block">
                        {faq.category}
                      </span>
                      <span className="text-base font-semibold text-white leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    <span className="text-brand shrink-0 mt-1">
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
