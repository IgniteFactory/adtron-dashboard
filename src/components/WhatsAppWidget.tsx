"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [message, setMessage] = useState("我想了解关于红薯榜单");

  const WHATSAPP_NUMBER = "60176631663"; // Customer Support Number (+60176631663)

  useEffect(() => {
    // Show tooltips after 3 seconds on load to grab attention
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const encodedMessage = encodeURIComponent(message.trim());
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Tooltip / Speech bubble prompt */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="relative mb-3 mr-1 bg-bg-surface border border-white/10 text-white text-xs px-4 py-2.5 rounded-2xl shadow-2xl max-w-[200px] text-center"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="absolute top-1 right-1 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="pr-3 leading-relaxed text-[11px] font-medium text-left">
              👋 您好！有任何关于“红薯榜”的问题，随时可以在这里向我咨询！
            </p>
            {/* Triangle tail */}
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-bg-surface border-r border-b border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[320px] md:w-[350px] rounded-3xl overflow-hidden bg-bg-surface/90 border border-white/10 shadow-2xl backdrop-blur-md"
          >
            {/* Support Header */}
            <div className="p-4 bg-zinc-950/40 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-xs select-none">
                  红薯
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-bg-surface animate-pulse" />
                </div>
                <div>
                  <h4 className="text-white text-xs font-bold leading-none">红薯榜单 客服经理</h4>
                  <p className="text-emerald-400 text-[10px] font-medium mt-1 flex items-center gap-1">
                    在线中 (通常几分钟内回复)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/5 rounded-full text-text-secondary hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Chat Bubble */}
            <div className="p-5 space-y-4 max-h-[260px] overflow-y-auto">
              <div className="flex items-start gap-2.5 max-w-[90%]">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-950/40 border border-white/5 flex items-center justify-center text-[10px] text-text-secondary select-none font-bold">
                  客服
                </div>
                <div className="bg-zinc-800/80 border border-white/5 text-white rounded-2xl rounded-tl-none p-3 text-xs leading-relaxed">
                  您好！👋 我是红薯榜单的客服经理。如果您对我们的拼单营销活动、博主阵容或合作流程有任何疑问，欢迎随时向我咨询！
                </div>
              </div>
            </div>

            {/* Chat message input and CTA button */}
            <form onSubmit={handleSend} className="p-4 bg-zinc-950/30 border-t border-white/5 space-y-3">
              <div>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="输入您想说的话..."
                  className="w-full bg-bg-main border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-text-secondary focus:outline-none focus:border-brand/40 resize-none leading-relaxed transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 bg-brand hover:scale-[1.02] active:scale-[0.98] text-bg-main rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(198,248,36,0.2)] hover:shadow-[0_0_20px_rgba(198,248,36,0.4)] cursor-pointer"
              >
                {/* Official WhatsApp SVG Logo */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>了解更多</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer relative overflow-hidden group ${
          isOpen
            ? "bg-zinc-800 border border-white/10 hover:border-white/20"
            : "bg-[#25D366] hover:bg-[#20ba5a] shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_25px_rgba(37,211,102,0.5)] border border-emerald-400/20"
        }`}
        aria-label="WhatsApp Chat Support"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small Notification Indicator */}
        {!isOpen && !showTooltip && (
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand shadow-[0_0_8px_#C6F824]"></span>
          </span>
        )}
      </button>
    </div>
  );
}
