"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Upload, Save, ImageIcon, ChevronDown, ChevronUp, Cloud, CloudOff } from "lucide-react";
import {
  siteContentDb,
  SiteContent,
  SITE_CONTENT_DEFAULTS,
  Testimonial,
  Step,
  StatItem,
} from "@/lib/siteContentDb";

const inputCls = "w-full bg-bg-main border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors";
const labelCls = "block text-xs font-semibold text-text-secondary uppercase tracking-widest mb-2";

// ── Collapsible section card ──
function SectionCard({
  order, title, children, defaultOpen = true,
}: {
  order: number; title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-bg-surface rounded-3xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-8 py-5 border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
          <span className="text-brand font-black text-sm leading-none">{order}</span>
        </div>
        <span className="text-base font-bold text-white flex-1 text-left">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
      </button>
      {open && <div className="p-8 space-y-8">{children}</div>}
    </div>
  );
}

// ── Simple text / textarea field ──
function TextField({ label, value, onChange, multiline = false, hint }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={4}
          className={`${inputCls} resize-none`}
        />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className={inputCls} />
      )}
      {hint && <p className="text-[11px] text-white/30 mt-1.5">{hint}</p>}
    </div>
  );
}

// ── Simple list editor (string[]) ──
function ListField({ label, items, onChange }: {
  label: string; items: string[]; onChange: (items: string[]) => void;
}) {
  const update = (idx: number, val: string) => {
    const next = [...items]; next[idx] = val; onChange(next);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const add = () => onChange([...items, '']);

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-xs font-bold flex-shrink-0">
              {idx + 1}
            </span>
            <input
              type="text"
              value={item}
              onChange={e => update(idx, e.target.value)}
              className="flex-1 bg-bg-main border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors"
            />
            <button
              onClick={() => remove(idx)}
              disabled={items.length <= 1}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 text-text-secondary hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={add}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:border-white/20 text-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} /> 添加一项
        </button>
      </div>
    </div>
  );
}

// ── Steps editor (Step[]) ──
function StepsField({ label, steps, onChange }: {
  label: string; steps: Step[]; onChange: (steps: Step[]) => void;
}) {
  const update = (idx: number, field: keyof Step, val: string) => {
    const next = steps.map((s, i) => i === idx ? { ...s, [field]: val } : s);
    onChange(next);
  };
  const remove = (idx: number) => onChange(steps.filter((_, i) => i !== idx));
  const add = () => onChange([...steps, { head: '', desc: '' }]);

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-bg-main rounded-2xl border border-white/[0.07] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brand">第 {idx + 1} 步</span>
              <button
                onClick={() => remove(idx)}
                disabled={steps.length <= 1}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/10 text-text-secondary hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <input
              type="text"
              value={step.head}
              onChange={e => update(idx, 'head', e.target.value)}
              placeholder="标题"
              className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors"
            />
            <input
              type="text"
              value={step.desc}
              onChange={e => update(idx, 'desc', e.target.value)}
              placeholder="描述"
              className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors"
            />
          </div>
        ))}
        <button
          onClick={add}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:border-white/20 text-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} /> 添加步骤
        </button>
      </div>
    </div>
  );
}

// ── Stats editor (StatItem[]) ──
function StatsField({ label, stats, onChange }: {
  label: string; stats: StatItem[]; onChange: (stats: StatItem[]) => void;
}) {
  const update = (idx: number, field: keyof StatItem, val: string) => {
    const next = stats.map((s, i) => i === idx ? { ...s, [field]: val } : s);
    onChange(next);
  };
  const remove = (idx: number) => onChange(stats.filter((_, i) => i !== idx));
  const add = () => onChange([...stats, { value: '', label: '' }]);

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="space-y-3">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-xs font-bold flex-shrink-0">
              {idx + 1}
            </span>
            <input
              type="text"
              value={stat.value}
              onChange={e => update(idx, 'value', e.target.value)}
              placeholder="数值（如 20位）"
              className="w-36 bg-bg-main border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors"
            />
            <input
              type="text"
              value={stat.label}
              onChange={e => update(idx, 'label', e.target.value)}
              placeholder="说明文字"
              className="flex-1 bg-bg-main border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors"
            />
            <button
              onClick={() => remove(idx)}
              disabled={stats.length <= 1}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 text-text-secondary hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={add}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:border-white/20 text-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} /> 添加统计项
        </button>
      </div>
    </div>
  );
}

// ── Testimonials editor ──
function TestimonialsField({
  testimonials, onChange, uploadingKey, onAvatarUpload,
}: {
  testimonials: Testimonial[];
  onChange: (t: Testimonial[]) => void;
  uploadingKey: string | null;
  onAvatarUpload: (idx: number, file: File) => void;
}) {
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const update = (idx: number, field: keyof Testimonial, val: string) => {
    onChange(testimonials.map((t, i) => i === idx ? { ...t, [field]: val } : t));
  };
  const remove = (idx: number) => onChange(testimonials.filter((_, i) => i !== idx));
  const add = () => onChange([...testimonials, { quote: '', name: '', biz: '', avatarUrl: '' }]);

  return (
    <div>
      <label className={labelCls}>商家好评</label>
      <div className="space-y-5">
        {testimonials.map((t, idx) => {
          const uploading = uploadingKey === `t-${idx}`;
          return (
            <div key={idx} className="bg-bg-main rounded-2xl border border-white/[0.07] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">好评 #{idx + 1}</span>
                <button
                  onClick={() => remove(idx)}
                  disabled={testimonials.length <= 1}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 text-text-secondary hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">头像图片</label>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-bg-surface border border-white/10 flex items-center justify-center flex-shrink-0">
                    {t.avatarUrl
                      ? <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                      : <ImageIcon className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={el => { fileRefs.current[idx] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) onAvatarUpload(idx, f); }}
                    />
                    <button
                      onClick={() => fileRefs.current[idx]?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-text-secondary hover:text-white hover:border-white/20 text-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" strokeWidth={2} />
                      {uploading ? '上传中…' : '上传图片'}
                    </button>
                    <input
                      type="text"
                      value={t.avatarUrl}
                      onChange={e => update(idx, 'avatarUrl', e.target.value)}
                      placeholder="或输入图片 URL…"
                      className="w-full bg-bg-surface border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-2">好评内容</label>
                <textarea
                  value={t.quote}
                  onChange={e => update(idx, 'quote', e.target.value)}
                  rows={3}
                  className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors resize-none"
                  placeholder="用户的真实反馈…"
                />
              </div>

              {/* Name + Biz */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">姓名</label>
                  <input
                    type="text"
                    value={t.name}
                    onChange={e => update(idx, 'name', e.target.value)}
                    className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors"
                    placeholder="刘玥婷"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">店铺 / 位置</label>
                  <input
                    type="text"
                    value={t.biz}
                    onChange={e => update(idx, 'biz', e.target.value)}
                    className="w-full bg-bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors"
                    placeholder="Café 秘葉，Petaling Jaya"
                  />
                </div>
              </div>
            </div>
          );
        })}
        <button
          onClick={add}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:border-white/20 text-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} /> 添加好评
        </button>
      </div>
    </div>
  );
}

// ══════════════ Main page ══════════════

function initDraft(): SiteContent {
  if (typeof window === 'undefined') return SITE_CONTENT_DEFAULTS;
  try {
    const raw = localStorage.getItem('redlist_site_content_v1');
    if (raw) return JSON.parse(raw) as SiteContent;
  } catch {}
  return SITE_CONTENT_DEFAULTS;
}

export default function ContentPage() {
  // Initialize synchronously from localStorage so fields are immediately editable
  const [draft, setDraft] = useState<SiteContent>(initDraft);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'synced' | 'local-only'>('idle');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const editedRef = useRef(false);

  // Silently try to load fresher data from Supabase on mount
  // Only update draft if the user hasn't started editing yet
  useEffect(() => {
    siteContentDb.getAll().then(data => {
      if (!editedRef.current) setDraft(data);
    }).catch(() => {});
  }, []);

  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    editedRef.current = true;
    setDraft(d => ({ ...d, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { supabaseSynced } = await siteContentDb.setAll(draft);
      setSaveStatus(supabaseSynced ? 'synced' : 'local-only');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (idx: number, file: File) => {
    setUploadingKey(`t-${idx}`);
    try {
      const url = await siteContentDb.uploadAvatar(file);
      set('testimonials', draft.testimonials.map((t, i) =>
        i === idx ? { ...t, avatarUrl: url } : t
      ));
    } catch (err) {
      console.error(err);
      alert('图片上传失败，请重试');
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">落地页内容</h1>
          <p className="text-text-secondary text-sm">
            编辑首页所有文案与图片。保存后立即在前台生效。
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-brand text-bg-main font-bold text-sm hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-60 disabled:scale-100 cursor-pointer"
          >
            <Save className="w-4 h-4" strokeWidth={2.5} />
            {saving ? '保存中…' : '保存全部'}
          </button>
          {saveStatus === 'synced' && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <Cloud className="w-3.5 h-3.5" /> 已保存并同步云端
            </span>
          )}
          {saveStatus === 'local-only' && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <CloudOff className="w-3.5 h-3.5" /> 已本地保存（云端同步失败）
            </span>
          )}
        </div>
      </div>

      {/* ── 1. Hero ── */}
      <SectionCard order={1} title="Hero — 首屏">
        <TextField
          label="大标题（用换行符分行，第二行显示为品牌色）"
          value={draft.hero_headline}
          onChange={v => set('hero_headline', v)}
          multiline
          hint={`预览: ${draft.hero_headline.split('\n').join(' · ')}`}
        />
        <TextField
          label="副标题"
          value={draft.hero_sub}
          onChange={v => set('hero_sub', v)}
          multiline
        />
        <TextField
          label="CTA 按钮文字"
          value={draft.hero_cta}
          onChange={v => set('hero_cta', v)}
        />
      </SectionCard>

      {/* ── 2. Marquee ── */}
      <SectionCard order={2} title="Marquee — 滚动标签栏" defaultOpen={false}>
        <ListField
          label="滚动标签（顺序排列，自动无限循环）"
          items={draft.marquee_items}
          onChange={v => set('marquee_items', v)}
        />
      </SectionCard>

      {/* ── 3. Pain ── */}
      <SectionCard order={3} title="Pain — 痛点区块">
        <TextField label="眉题小标签" value={draft.pain_eyebrow} onChange={v => set('pain_eyebrow', v)} />
        <TextField
          label="大标题（可用换行符分行）"
          value={draft.pain_headline}
          onChange={v => set('pain_headline', v)}
          multiline
          hint={`预览: ${draft.pain_headline.split('\n').join(' · ')}`}
        />
        <TextField
          label="引导段（可换行，最后一句会加粗显示）"
          value={draft.pain_intro}
          onChange={v => set('pain_intro', v)}
          multiline
        />
        <TextField
          label="引导段末尾强调句（白色加粗）"
          value={draft.pain_intro_highlight}
          onChange={v => set('pain_intro_highlight', v)}
        />
        <ListField
          label="痛点段落（第一条白色大字，其余灰色正文）"
          items={draft.pain_points}
          onChange={v => set('pain_points', v)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="结语第一行（粗体白色斜体）"
            value={draft.pain_closing_line1}
            onChange={v => set('pain_closing_line1', v)}
          />
          <TextField
            label="结语第二行（灰色斜体）"
            value={draft.pain_closing_line2}
            onChange={v => set('pain_closing_line2', v)}
          />
        </div>
      </SectionCard>

      {/* ── 4. Solution ── */}
      <SectionCard order={4} title="Solution — 解决方案区块" defaultOpen={false}>
        <TextField
          label="介绍段落"
          value={draft.solution_intro}
          onChange={v => set('solution_intro', v)}
          multiline
        />
        <TextField
          label="补充说明（小字）"
          value={draft.solution_sub}
          onChange={v => set('solution_sub', v)}
        />
      </SectionCard>

      {/* ── 5. Testimonials ── */}
      <SectionCard order={5} title="Testimonials — 商家好评">
        <TestimonialsField
          testimonials={draft.testimonials}
          onChange={v => set('testimonials', v)}
          uploadingKey={uploadingKey}
          onAvatarUpload={handleAvatarUpload}
        />
        <StatsField
          label="数据展示栏（好评区块下方）"
          stats={draft.stats_bar}
          onChange={v => set('stats_bar', v)}
        />
      </SectionCard>

      {/* ── 6. How to Join ── */}
      <SectionCard order={6} title="How to Join — 加入流程" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField label="区块标题" value={draft.join_heading} onChange={v => set('join_heading', v)} />
          <TextField label="副标题" value={draft.join_sub} onChange={v => set('join_sub', v)} />
        </div>
        <StepsField
          label="步骤列表"
          steps={draft.steps}
          onChange={v => set('steps', v)}
        />
      </SectionCard>

      {/* ── 7. Closing CTA ── */}
      <SectionCard order={7} title="Closing CTA — 底部行动区块" defaultOpen={false}>
        <TextField label="主标题" value={draft.cta_heading} onChange={v => set('cta_heading', v)} />
        <TextField label="副标题（灰色小字）" value={draft.cta_sub} onChange={v => set('cta_sub', v)} />
        <ListField
          label="权益列表（勾选图标列表）"
          items={draft.offer_bullets}
          onChange={v => set('offer_bullets', v)}
        />
      </SectionCard>

      {/* ── 8. Analytics / GTM ── */}
      <SectionCard order={8} title="分析与追踪 — Google Tag Manager" defaultOpen={false}>
        <div>
          <TextField
            label="GTM 容器 ID"
            value={draft.gtm_id}
            onChange={v => set('gtm_id', v.trim())}
            hint="格式：GTM-XXXXXXX。留空则不注入任何追踪代码。保存后自动在所有页面生效，无需重新部署。"
          />
          {draft.gtm_id && !/^GTM-[A-Z0-9]+$/.test(draft.gtm_id) && (
            <p className="text-amber-400 text-xs mt-2 font-medium">
              ⚠ ID 格式似乎不正确，标准格式为 GTM-XXXXXXX（大写字母 + 数字）
            </p>
          )}
          {draft.gtm_id && /^GTM-[A-Z0-9]+$/.test(draft.gtm_id) && (
            <p className="text-emerald-400 text-xs mt-2 font-medium">
              ✓ 格式正确，保存后将在所有页面自动加载 GTM
            </p>
          )}
        </div>
      </SectionCard>

      {/* Sticky save bar (mobile) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden flex flex-col items-center gap-2">
        {saveStatus === 'synced' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-bg-surface px-3 py-1.5 rounded-full border border-emerald-400/20">
            <Cloud className="w-3 h-3" /> 已同步云端
          </span>
        )}
        {saveStatus === 'local-only' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium bg-bg-surface px-3 py-1.5 rounded-full border border-amber-400/20">
            <CloudOff className="w-3 h-3" /> 云端同步失败
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-brand text-bg-main font-bold text-sm shadow-[0_8px_24px_rgba(198,248,36,0.3)] disabled:opacity-60 cursor-pointer"
        >
          <Save className="w-4 h-4" strokeWidth={2.5} />
          {saving ? '保存中…' : '保存全部'}
        </button>
      </div>
    </div>
  );
}
