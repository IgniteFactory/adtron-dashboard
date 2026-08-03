"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Plus, Trash2, ChevronDown, ChevronUp, Upload, ImageIcon,
  Save, BarChart2, ArrowLeft, CheckSquare, Square, User, Cloud, CloudOff,
} from "lucide-react";
import { supabaseDb } from "@/lib/supabaseDb";
import { Campaign, UserLead } from "@/lib/mockDb";
import {
  reportDb, CampaignReportData, KOL, KOLStats,
  MerchantReportConfig, newKOL, emptyStats, DEFAULT_MERCHANT_CONFIG,
} from "@/lib/reportDb";

// ── Styling constants ────────────────────────────────────────
const inputCls = "w-full bg-bg-main border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors";
const labelCls = "block text-xs font-semibold text-text-secondary uppercase tracking-widest mb-1.5";
const numInputCls = "w-full bg-bg-main border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 text-center focus:outline-none focus:border-brand/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// ── Stat period column ───────────────────────────────────────
function StatColumn({ label, stats, onChange }: {
  label: string;
  stats: KOLStats | null;
  onChange: (s: KOLStats | null) => void;
}) {
  const enabled = stats !== null;
  const s = stats ?? emptyStats();
  const update = (field: keyof KOLStats, val: number) =>
    onChange({ ...s, [field]: val });

  return (
    <div className={`rounded-xl p-4 border transition-colors ${enabled ? 'bg-bg-main border-brand/20' : 'bg-bg-main/50 border-white/5'}`}>
      <label className="flex items-center gap-2.5 cursor-pointer mb-4">
        <div
          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${enabled ? 'bg-brand' : 'bg-white/10 border border-white/20'}`}
          onClick={() => onChange(enabled ? null : emptyStats())}
        >
          {enabled && <span className="text-bg-main text-xs font-black">✓</span>}
        </div>
        <span className="text-sm font-bold text-white">{label}</span>
      </label>
      {enabled && (
        <div className="space-y-2">
          {([ ['reach', '曝光量'], ['likes', '点赞数'], ['comments', '评论数'], ['shares', '分享数'], ['bookmarks', '收藏数'] ] as [keyof KOLStats, string][]).map(([field, name]) => (
            <div key={field} className="flex items-center gap-2">
              <span className="text-xs text-text-secondary w-14 flex-shrink-0">{name}</span>
              <input
                type="number"
                min={0}
                value={s[field]}
                onChange={e => update(field, Number(e.target.value) || 0)}
                className={numInputCls}
              />
            </div>
          ))}
        </div>
      )}
      {!enabled && (
        <button
          onClick={() => onChange(emptyStats())}
          className="w-full text-xs text-text-secondary hover:text-white border border-white/10 hover:border-white/20 rounded-lg py-2 transition-colors cursor-pointer"
        >
          + 录入数据
        </button>
      )}
    </div>
  );
}

// ── Image upload field ───────────────────────────────────────
function ImageUploadField({ label, url, uploading, onUpload, onChange, shape }: {
  label: string;
  url: string;
  uploading: boolean;
  onUpload: (f: File) => void;
  onChange: (url: string) => void;
  shape: 'circle' | 'portrait';
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className={labelCls}>{label}</p>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 bg-bg-main border border-white/10 overflow-hidden flex items-center justify-center ${shape === 'circle' ? 'w-14 h-14 rounded-full' : 'w-14 h-[75px] rounded-lg'}`}>
          {url
            ? <img src={url} alt="" className="w-full h-full object-cover" />
            : <ImageIcon className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
          }
        </div>
        <div className="flex-1 space-y-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-text-secondary hover:text-white hover:border-white/20 text-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            {uploading ? '上传中…' : '上传图片'}
          </button>
          <input
            type="text" value={url}
            onChange={e => onChange(e.target.value)}
            placeholder="或粘贴图片 URL…"
            className="w-full bg-bg-surface border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

// ── Status checkbox row ──────────────────────────────────────
function StatusRow({ label, checked, date, onCheck, onDate }: {
  label: string; checked: boolean; date: string;
  onCheck: (v: boolean) => void; onDate: (d: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onCheck(!checked)} className="flex-shrink-0 cursor-pointer">
        {checked
          ? <CheckSquare className="w-5 h-5 text-brand" />
          : <Square className="w-5 h-5 text-text-secondary" />}
      </button>
      <span className={`text-sm flex-shrink-0 w-24 ${checked ? 'text-white font-medium' : 'text-text-secondary'}`}>{label}</span>
      {checked && (
        <input
          type="date"
          value={date}
          onChange={e => onDate(e.target.value)}
          className="bg-bg-main border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand/50 transition-colors"
        />
      )}
    </div>
  );
}

// ── KOL accordion card ───────────────────────────────────────
function KOLCard({
  kol, index, isExpanded, onToggle, onUpdate, onRemove,
  uploading, onUploadImage,
}: {
  kol: KOL; index: number; isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<KOL>) => void;
  onRemove: () => void;
  uploading: Record<string, boolean>;
  onUploadImage: (kolId: string, type: 'profile' | 'cover', file: File) => void;
}) {
  const u = (field: keyof KOL, val: unknown) => onUpdate({ [field]: val } as Partial<KOL>);
  const bestStats = reportDb.getBestStats(kol);

  return (
    <div className="bg-bg-surface rounded-2xl border border-white/[0.07] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-4">
        <button onClick={onToggle} className="flex items-center gap-4 flex-1 cursor-pointer text-left">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {kol.profilePicUrl
              ? <img src={kol.profilePicUrl} alt="" className="w-full h-full object-cover rounded-xl" />
              : <User className="w-4 h-4 text-text-secondary" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">
              {kol.name || <span className="text-text-secondary">博主 #{index + 1}</span>}
            </div>
            <div className="text-xs text-text-secondary truncate">
              {kol.handle ? `@${kol.handle}` : '未填写'} {bestStats ? `· ${reportDb.getBestPeriodLabel(kol)}数据` : ''}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {kol.published && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">已发布</span>}
            {!kol.published && kol.draftApproved && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">草稿已批</span>}
            {!kol.published && !kol.draftApproved && kol.draftCompleted && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/20">草稿中</span>}
          </div>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-secondary flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-secondary flex-shrink-0" />}
        </button>
        <button onClick={onRemove} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 text-text-secondary hover:text-red-400 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="px-5 pb-6 border-t border-white/[0.05] pt-5 space-y-6">
          {/* Images */}
          <div className="grid grid-cols-2 gap-6">
            <ImageUploadField
              label="博主头像"
              url={kol.profilePicUrl}
              uploading={!!uploading[`${kol.id}-profile`]}
              onUpload={f => onUploadImage(kol.id, 'profile', f)}
              onChange={v => u('profilePicUrl', v)}
              shape="circle"
            />
            <ImageUploadField
              label="帖子封面图"
              url={kol.postCoverUrl}
              uploading={!!uploading[`${kol.id}-cover`]}
              onUpload={f => onUploadImage(kol.id, 'cover', f)}
              onChange={v => u('postCoverUrl', v)}
              shape="portrait"
            />
          </div>

          {/* Name + Handle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>博主真实姓名</label>
              <input type="text" value={kol.name} onChange={e => u('name', e.target.value)} placeholder="姓名" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>小红书用户名</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm">@</span>
                <input type="text" value={kol.handle} onChange={e => u('handle', e.target.value)} placeholder="handle" className={`${inputCls} pl-8`} />
              </div>
            </div>
          </div>

          {/* Status milestones */}
          <div>
            <p className={labelCls}>合作进度</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StatusRow label="草稿完成" checked={kol.draftCompleted} date={kol.draftCompletedDate}
                onCheck={v => u('draftCompleted', v)} onDate={d => u('draftCompletedDate', d)} />
              <StatusRow label="草稿审核" checked={kol.draftApproved} date={kol.draftApprovedDate}
                onCheck={v => u('draftApproved', v)} onDate={d => u('draftApprovedDate', d)} />
              <StatusRow label="帖子发布" checked={kol.published} date={kol.publishedDate}
                onCheck={v => u('published', v)} onDate={d => u('publishedDate', d)} />
              <StatusRow label="数据提交" checked={kol.insightSubmitted} date={kol.insightSubmittedDate}
                onCheck={v => u('insightSubmitted', v)} onDate={d => u('insightSubmittedDate', d)} />
            </div>
          </div>

          {/* Stats per period */}
          <div>
            <p className={labelCls}>帖子数据统计</p>
            <div className="grid grid-cols-3 gap-3">
              <StatColumn label="7天数据" stats={kol.stats7} onChange={s => onUpdate({ stats7: s })} />
              <StatColumn label="14天数据" stats={kol.stats14} onChange={s => onUpdate({ stats14: s })} />
              <StatColumn label="28天数据" stats={kol.stats28} onChange={s => onUpdate({ stats28: s })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function ReportEntryPage() {
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [leads, setLeads] = useState<UserLead[]>([]);
  const [report, setReport] = useState<CampaignReportData>(() => reportDb.getLocal(id ?? ''));
  const [selectedLeadId, setSelectedLeadId] = useState<string>('custom');
  const [tab, setTab] = useState<'kols' | 'settings'>('kols');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'synced' | 'local-only'>('idle');
  const editedRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    supabaseDb.getCampaignById(id).then(setCampaign);
    supabaseDb.getLeads().then(all => setLeads(all.filter(l => l.campaignId === id)));

    // Async refresh from Supabase — only apply if the user hasn't started editing yet
    reportDb.getAll(id).then(remote => {
      if (!editedRef.current) {
        setReport(remote);
        if (remote.kols.length > 0) {
          setExpandedIds(new Set([remote.kols[0].id]));
        }
      }
    }).catch(() => {});
  }, [id]);

  const updateKOL = (kolId: string, updates: Partial<KOL>) => {
    editedRef.current = true;
    setReport(prev => ({
      ...prev,
      kols: prev.kols.map(k => k.id === kolId ? { ...k, ...updates } : k),
    }));
  };

  const addKOL = () => {
    editedRef.current = true;
    const k = newKOL();
    setReport(prev => ({ ...prev, kols: [...prev.kols, k] }));
    setExpandedIds(prev => new Set([...prev, k.id]));
  };

  const removeKOL = (kolId: string) => {
    setReport(prev => ({ ...prev, kols: prev.kols.filter(k => k.id !== kolId) }));
    setExpandedIds(prev => { const n = new Set(prev); n.delete(kolId); return n; });
  };

  const toggleExpand = (kolId: string) =>
    setExpandedIds(prev => {
      const n = new Set(prev);
      n.has(kolId) ? n.delete(kolId) : n.add(kolId);
      return n;
    });

  const getMerchantConfig = (leadId: string): MerchantReportConfig => {
    if (report.merchantConfigs[leadId]) return report.merchantConfigs[leadId];
    const lead = leads.find(l => l.id === leadId);
    return {
      ...DEFAULT_MERCHANT_CONFIG,
      displayCompanyName: lead?.companyName ?? '',
      displayPicName: lead?.picName ?? '',
    };
  };

  const updateMerchantConfig = (leadId: string, updates: Partial<MerchantReportConfig>) => {
    editedRef.current = true;
    setReport(prev => ({
      ...prev,
      merchantConfigs: {
        ...prev.merchantConfigs,
        [leadId]: { ...getMerchantConfig(leadId), ...updates },
      },
    }));
  };

  const uploadKOLImage = async (kolId: string, type: 'profile' | 'cover', file: File) => {
    const key = `${kolId}-${type}`;
    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      const url = await supabaseDb.uploadImage(file);
      updateKOL(kolId, type === 'profile' ? { profilePicUrl: url } : { postCoverUrl: url });
    } catch {
      alert('图片上传失败，请重试');
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { supabaseSynced } = await reportDb.setAll(report);
      setSaveStatus(supabaseSynced ? 'synced' : 'local-only');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    await reportDb.setAll(report); // persist before opening
    window.open(`/report/${id}/view?leadId=${selectedLeadId}`, '_blank');
  };

  const mc = getMerchantConfig(selectedLeadId);
  const publishedCount = report.kols.filter(k => k.published).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin" className="text-text-secondary hover:text-white text-sm mb-2 flex items-center gap-1.5 w-fit">
            <ArrowLeft className="w-3.5 h-3.5" /> 返回控制台
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-xl"><BarChart2 className="w-6 h-6 text-brand" /></div>
            活动报告
          </h1>
          {campaign && <p className="text-text-secondary">{campaign.title}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:border-white/20 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中…' : '保存草稿'}
            </button>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-brand text-bg-main font-bold text-sm hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
            >
              <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
              生成报告
            </button>
          </div>
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

      {/* Tabs */}
      <div className="flex gap-1 bg-bg-surface p-1 rounded-2xl border border-white/5 w-fit">
        {(['kols', 'settings'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${tab === t ? 'bg-white/10 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            {t === 'kols' ? `博主管理 ${report.kols.length > 0 ? `(${report.kols.length})` : ''}` : '报告设置'}
          </button>
        ))}
      </div>

      {/* ── Tab: KOL Management ── */}
      {tab === 'kols' && (
        <div className="space-y-4">
          {/* Campaign info bar */}
          {campaign && (
            <div className="bg-bg-surface p-4 rounded-2xl border border-white/5 flex items-center gap-6 text-sm">
              <div><span className="text-text-secondary">博主配额：</span><span className="text-white font-bold">{campaign.targetSlots} 位</span></div>
              <div><span className="text-text-secondary">已录入：</span><span className="text-white font-bold">{report.kols.length} 位</span></div>
              <div><span className="text-text-secondary">已发布：</span><span className="text-emerald-400 font-bold">{publishedCount} 位</span></div>
              <div><span className="text-text-secondary">数据完整：</span><span className={`font-bold ${reportDb.allInsightsIn(report.kols) ? 'text-emerald-400' : 'text-amber-400'}`}>
                {reportDb.allInsightsIn(report.kols) ? '✓ 全部完成' : '尚未完整'}
              </span></div>
            </div>
          )}

          {/* KOL list */}
          <div className="space-y-3">
            {report.kols.map((kol, idx) => (
              <KOLCard
                key={kol.id}
                kol={kol}
                index={idx}
                isExpanded={expandedIds.has(kol.id)}
                onToggle={() => toggleExpand(kol.id)}
                onUpdate={updates => updateKOL(kol.id, updates)}
                onRemove={() => removeKOL(kol.id)}
                uploading={uploading}
                onUploadImage={uploadKOLImage}
              />
            ))}
          </div>

          {report.kols.length === 0 && (
            <div className="bg-bg-surface rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <User className="w-10 h-10 text-text-secondary mx-auto mb-4" strokeWidth={1} />
              <p className="text-text-secondary mb-4">还没有录入任何博主，点击下方按钮开始</p>
            </div>
          )}

          <button
            onClick={addKOL}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:border-brand/30 hover:bg-brand/5 text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> 添加博主
          </button>
        </div>
      )}

      {/* ── Tab: Report Settings ── */}
      {tab === 'settings' && (
        <div className="space-y-6">
          {/* Merchant selector */}
          <div className="bg-bg-surface p-6 rounded-3xl border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">报告接收方</h2>
            <p className="text-sm text-text-secondary mb-4">选择要将报告发给哪位商家，或手动填写公司名称。</p>
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setSelectedLeadId('custom')}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${selectedLeadId === 'custom' ? 'bg-brand/10 border-brand/30 text-brand' : 'border-white/10 text-text-secondary hover:text-white hover:border-white/20'}`}
              >
                自定义
              </button>
              {leads.map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLeadId(l.id)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${selectedLeadId === l.id ? 'bg-brand/10 border-brand/30 text-brand' : 'border-white/10 text-text-secondary hover:text-white hover:border-white/20'}`}
                >
                  {l.companyName}
                </button>
              ))}
              {leads.length === 0 && (
                <p className="text-sm text-text-secondary italic">此活动尚无线索记录，使用"自定义"手动填写</p>
              )}
            </div>

            {/* Display name overrides */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>报告显示公司名称</label>
                <input
                  type="text"
                  value={mc.displayCompanyName}
                  onChange={e => updateMerchantConfig(selectedLeadId, { displayCompanyName: e.target.value })}
                  placeholder="公司名称"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>报告显示负责人姓名</label>
                <input
                  type="text"
                  value={mc.displayPicName}
                  onChange={e => updateMerchantConfig(selectedLeadId, { displayPicName: e.target.value })}
                  placeholder="负责人姓名"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Merchant ROI section */}
          <div className="bg-bg-surface p-6 rounded-3xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">商业回报预估</h2>
                <p className="text-sm text-text-secondary mt-0.5">可选显示项。勾选后将在报告末尾附上预估营收分析。</p>
              </div>
              <button
                onClick={() => updateMerchantConfig(selectedLeadId, { showMerchantMetrics: !mc.showMerchantMetrics })}
                className="cursor-pointer"
              >
                <div className={`w-12 h-6 rounded-full transition-colors relative ${mc.showMerchantMetrics ? 'bg-brand' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${mc.showMerchantMetrics ? 'left-6' : 'left-0.5'}`} />
                </div>
              </button>
            </div>

            {mc.showMerchantMetrics && (
              <div className="space-y-6 pt-2 border-t border-white/[0.06]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>平均每人消费 (RM)</label>
                    <input
                      type="number" min={0} value={mc.avgSpend}
                      onChange={e => updateMerchantConfig(selectedLeadId, { avgSpend: Number(e.target.value) || 0 })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>平均结伴人数 (默认 2)</label>
                    <input
                      type="number" min={1} value={mc.avgGroupSize}
                      onChange={e => updateMerchantConfig(selectedLeadId, { avgGroupSize: Number(e.target.value) || 1 })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <p className={labelCls}>转化率假设</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">收藏转化率 (%)</label>
                      <input type="number" min={0} max={100} value={mc.saveConvRate}
                        onChange={e => updateMerchantConfig(selectedLeadId, { saveConvRate: Number(e.target.value) || 0 })}
                        className={inputCls} />
                      <p className="text-[10px] text-white/30 mt-1">默认 30%</p>
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">点赞/评论转化率 (%)</label>
                      <input type="number" min={0} max={100} value={mc.likeConvRate}
                        onChange={e => updateMerchantConfig(selectedLeadId, { likeConvRate: Number(e.target.value) || 0 })}
                        className={inputCls} />
                      <p className="text-[10px] text-white/30 mt-1">默认 5%</p>
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1.5">曝光转化率 (%)</label>
                      <input type="number" min={0} max={100} value={mc.impressionConvRate}
                        onChange={e => updateMerchantConfig(selectedLeadId, { impressionConvRate: Number(e.target.value) || 0 })}
                        className={inputCls} />
                      <p className="text-[10px] text-white/30 mt-1">默认 1%</p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-bg-main rounded-xl border border-white/[0.06] text-xs text-text-secondary font-mono leading-relaxed">
                    预估营收 = (曝光% × (曝光量 - 收藏 - 互动)) + (收藏% × 收藏量) + (互动% × (点赞+评论))
                    <br/>× 结伴人数 × 人均消费
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generate button CTA */}
          <div className="bg-brand/5 border border-brand/20 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <p className="text-white font-bold">准备好了吗？</p>
              <p className="text-text-secondary text-sm mt-0.5">点击生成报告，数据自动保存后在新标签页预览并导出 PDF。</p>
            </div>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-brand text-bg-main font-bold text-sm hover:scale-[1.03] transition-all cursor-pointer"
            >
              <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
              生成报告 →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
