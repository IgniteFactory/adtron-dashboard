"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, HelpCircle } from "lucide-react";
import { faqDb, FAQ, FAQ_CATEGORIES, FaqCategory } from "@/lib/faqDb";
import { motion, AnimatePresence } from "framer-motion";

const EMPTY_FORM = {
  question: "",
  answer: "",
  category: FAQ_CATEGORIES[0] as FaqCategory,
  displayStatus: false,
};

export default function SettingsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filterCat, setFilterCat] = useState<FaqCategory | "全部">("全部");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setFaqs(faqDb.getFaqs());
  }, []);

  const reload = () => setFaqs(faqDb.getFaqs());

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      displayStatus: faq.displayStatus,
    });
    setEditingId(faq.id);
    setIsFormOpen(true);
  };

  const handleSubmit = () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    if (editingId) {
      faqDb.updateFaq(editingId, form);
    } else {
      faqDb.addFaq(form);
    }
    reload();
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    faqDb.deleteFaq(id);
    reload();
    setDeleteConfirm(null);
  };

  const toggleDisplay = (faq: FAQ) => {
    faqDb.updateFaq(faq.id, { displayStatus: !faq.displayStatus });
    reload();
  };

  const filtered =
    filterCat === "全部" ? faqs : faqs.filter((f) => f.category === filterCat);

  const displayCount = faqs.filter((f) => f.displayStatus).length;

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">系统设置</h1>
          <p className="text-text-secondary">管理常见问题（FAQ）内容与展示状态。</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-brand text-bg-main font-bold text-sm hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_0_20px_rgba(198,248,36,0.2)] cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          新增问题
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "全部问题", value: faqs.length },
          { label: "已展示（详情页）", value: displayCount },
          ...FAQ_CATEGORIES.slice(0, 2).map((c) => ({
            label: c,
            value: faqs.filter((f) => f.category === c).length,
          })),
        ].map((s) => (
          <div key={s.label} className="bg-bg-surface border border-white/5 rounded-2xl p-5">
            <p className="text-3xl font-black text-white mb-1">{s.value}</p>
            <p className="text-xs text-text-secondary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {(["全部", ...FAQ_CATEGORIES] as Array<FaqCategory | "全部">).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              filterCat === cat
                ? "bg-brand text-bg-main"
                : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Table */}
      <div className="bg-bg-surface rounded-3xl border border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] text-xs font-bold text-text-secondary uppercase tracking-wider px-6 py-4 border-b border-white/5">
          <span>问题 / 分类</span>
          <span className="text-center px-4">展示状态</span>
          <span className="text-center px-4">操作</span>
          <span />
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary gap-3">
            <HelpCircle className="w-10 h-10 opacity-20" />
            <p>暂无问题</p>
          </div>
        )}

        <div className="divide-y divide-white/[0.04]">
          {filtered.map((faq) => (
            <div
              key={faq.id}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="min-w-0 pr-6">
                <p className="text-white font-medium text-sm line-clamp-1 mb-1">{faq.question}</p>
                <span className="inline-block text-[11px] font-bold text-brand/70 bg-brand/[0.08] border border-brand/15 px-2 py-0.5 rounded-full">
                  {faq.category}
                </span>
              </div>

              {/* Display toggle */}
              <div className="px-4 flex items-center justify-center">
                <button
                  onClick={() => toggleDisplay(faq)}
                  title={faq.displayStatus ? "点击隐藏" : "点击展示"}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                    faq.displayStatus ? "bg-brand" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-bg-main transition-all duration-300 ${
                      faq.displayStatus ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Edit */}
              <div className="px-4">
                <button
                  onClick={() => openEdit(faq)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delete */}
              <div>
                {deleteConfirm === faq.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(faq.id)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 text-text-secondary hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl bg-bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white">
                  {editingId ? "编辑问题" : "新增问题"}
                </h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Question */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    问题 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    placeholder="请输入问题"
                    className="w-full bg-bg-main border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors"
                  />
                </div>

                {/* Answer */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    答案 <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    placeholder="请输入答案内容"
                    rows={6}
                    className="w-full bg-bg-main border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    分类 <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FAQ_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          form.category === cat
                            ? "bg-brand text-bg-main"
                            : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Status */}
                <div className="flex items-center justify-between p-4 bg-bg-main rounded-xl border border-white/[0.07]">
                  <div>
                    <p className="text-white font-medium text-sm">展示于活动详情页</p>
                    <p className="text-text-secondary text-xs mt-0.5">开启后，此问题将显示在每个活动详情页底部</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, displayStatus: !form.displayStatus })}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                      form.displayStatus ? "bg-brand" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-bg-main transition-all duration-300 ${
                        form.displayStatus ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 h-11 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!form.question.trim() || !form.answer.trim()}
                    className="flex-1 h-11 rounded-xl bg-brand text-bg-main text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
                  >
                    {editingId ? "保存修改" : "新增问题"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
