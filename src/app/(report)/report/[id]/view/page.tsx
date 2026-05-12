"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Printer, Flame, TrendingUp, Eye, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { supabaseDb } from "@/lib/supabaseDb";
import { Campaign } from "@/lib/mockDb";
import { reportDb, CampaignReportData, KOL, KOLStats, DEFAULT_MERCHANT_CONFIG, MerchantReportConfig } from "@/lib/reportDb";

// ── Utilities ────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('en-MY');
}

function isFirePost(stats: KOLStats): boolean {
  return stats.reach > 300 || (stats.likes + stats.bookmarks) > 100;
}

// ── Tier-1 metric card ───────────────────────────────────────
function MetricCard({ label, value, soFar, accent, sub }: {
  label: string; value: string | number; soFar?: boolean;
  accent?: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex flex-col gap-1.5 print-card">
      <div className={`text-[10px] font-bold uppercase tracking-widest ${accent ?? 'text-gray-400'}`}>{label}</div>
      <div className="text-3xl font-black text-gray-900 leading-none tracking-tight">
        {typeof value === 'number' ? fmt(value) : value}
        {soFar && <span className="text-sm font-semibold text-amber-500 ml-1.5">（累计）</span>}
      </div>
      {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
    </div>
  );
}

// ── Top-3 post card ──────────────────────────────────────────
const MEDAL_COLORS = [
  { ring: 'ring-yellow-400', badge: 'bg-yellow-400 text-yellow-900', label: '🥇 #1' },
  { ring: 'ring-gray-300', badge: 'bg-gray-300 text-gray-800', label: '🥈 #2' },
  { ring: 'ring-amber-600/60', badge: 'bg-amber-700 text-amber-100', label: '🥉 #3' },
];

function TopPostCard({ kol, rank, stats }: { kol: KOL; rank: number; stats: KOLStats }) {
  const m = MEDAL_COLORS[rank] ?? MEDAL_COLORS[2];
  return (
    <div className={`bg-white rounded-2xl border-2 ${m.ring} overflow-hidden shadow-md flex flex-col print-card`}>
      {/* Cover image */}
      <div className="relative aspect-[4/4] bg-gray-100 overflow-hidden">
        {kol.postCoverUrl
          ? <img src={kol.postCoverUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📷</div>}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-black ${m.badge}`}>{m.label}</span>
        {isFirePost(stats) && (
          <span className="absolute top-3 right-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </span>
        )}
      </div>
      {/* Info */}
      <div className="p-3 flex-1">
        <div className="flex items-center gap-2 mb-2">
          {kol.profilePicUrl
            ? <img src={kol.profilePicUrl} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" />
            : <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />}
          <div>
            <div className="text-sm font-bold text-gray-900 leading-tight">{kol.name || '—'}</div>
            {kol.handle && <div className="text-xs text-gray-400">@{kol.handle}</div>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <div className="text-green-700 font-black text-base">{fmt(stats.reach)}</div>
            <div className="text-green-600">浏览量</div>
          </div>
          <div className="bg-red-50 rounded-lg p-2 text-center">
            <div className="text-red-500 font-black text-base">{fmt(stats.likes)}</div>
            <div className="text-red-400">点赞</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <div className="text-blue-600 font-black text-base">{fmt(stats.bookmarks)}</div>
            <div className="text-blue-500">收藏</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 text-center">
            <div className="text-purple-600 font-black text-base">{fmt(stats.comments)}</div>
            <div className="text-purple-500">评论</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Individual post card ─────────────────────────────────────
function PostCard({ kol }: { kol: KOL }) {
  const stats = reportDb.getBestStats(kol);
  const period = reportDb.getBestPeriodLabel(kol);
  if (!stats) return null;
  const fire = isFirePost(stats);

  return (
    <div className={`bg-white rounded-xl overflow-hidden border ${fire ? 'border-orange-200' : 'border-gray-100'} shadow-sm print-card`}>
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {kol.postCoverUrl
          ? <img src={kol.postCoverUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📷</div>}
        {fire && (
          <span className="absolute top-2 right-2 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow">
            <Flame className="w-3.5 h-3.5 text-white" />
          </span>
        )}
        {kol.profilePicUrl && (
          <img src={kol.profilePicUrl} alt="" className="absolute bottom-2 left-2 w-7 h-7 rounded-full object-cover border-2 border-white shadow" />
        )}
        {period && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white font-bold">{period}</span>
        )}
      </div>
      {/* Info */}
      <div className="p-3">
        <div className="text-xs font-bold text-gray-900 truncate">{kol.name || '—'}</div>
        {kol.handle && <div className="text-[10px] text-gray-400 truncate mb-2">@{kol.handle}</div>}
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          <div className="flex items-center gap-1 text-gray-500"><Eye className="w-3 h-3 text-green-500" /><span className="font-bold text-gray-800">{fmt(stats.reach)}</span></div>
          <div className="flex items-center gap-1 text-gray-500"><Heart className="w-3 h-3 text-red-400" /><span className="font-bold text-gray-800">{fmt(stats.likes)}</span></div>
          <div className="flex items-center gap-1 text-gray-500"><Bookmark className="w-3 h-3 text-blue-400" /><span className="font-bold text-gray-800">{fmt(stats.bookmarks)}</span></div>
          <div className="flex items-center gap-1 text-gray-500"><MessageCircle className="w-3 h-3 text-purple-400" /><span className="font-bold text-gray-800">{fmt(stats.comments)}</span></div>
        </div>
      </div>
    </div>
  );
}

// ── ROI section ──────────────────────────────────────────────
function ROISection({ reach, saves, likesComments, cfg, merchantCount }: {
  reach: number; saves: number; likesComments: number;
  cfg: MerchantReportConfig; merchantCount: number;
}) {
  const nonEng = Math.max(0, reach - saves - likesComments);
  const totalCustomers = reportDb.estimateTotalCustomers(reach, saves, likesComments, cfg);
  const perMerchantCustomers = merchantCount > 1 ? totalCustomers / merchantCount : totalCustomers;
  const revenue = perMerchantCustomers * cfg.avgGroupSize * cfg.avgSpend;

  return (
    <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-8 print-card">
      <h2 className="text-xl font-black text-gray-900 mb-1">商业回报预估</h2>
      <p className="text-sm text-gray-500 mb-6">以下数字为基于转化率假设的保守估算，仅供参考。</p>

      {/* Multi-merchant context banner */}
      {merchantCount > 1 && (
        <div className="mb-6 bg-white/70 rounded-xl px-5 py-3 border border-green-100 flex items-center gap-4">
          <div className="text-3xl font-black text-green-300">÷</div>
          <div>
            <div className="text-sm font-bold text-gray-700">此活动共有 <span className="text-green-700">{merchantCount}</span> 家商家参与</div>
            <div className="text-xs text-gray-400 mt-0.5">合集帖子的总曝光量平均分配至各商家，以下营收为<span className="font-bold">本店</span>的预估贡献</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-8">
        {merchantCount > 1 ? (
          <>
            {/* Total (context, de-emphasized) */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">活动总客户数</div>
              <div className="text-3xl font-black text-gray-300">{Math.round(totalCustomers).toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">÷ {merchantCount} 家商家</div>
            </div>
            {/* Per-merchant customers */}
            <div className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">本店预估客户数</div>
              <div className="text-3xl font-black text-gray-900">{Math.round(perMerchantCustomers).toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">人次</div>
            </div>
            {/* Revenue */}
            <div className="bg-green-600 rounded-2xl p-5 shadow-md text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-green-200 mb-2">本店预估营收</div>
              <div className="text-3xl font-black text-white">RM {fmt(Math.round(revenue))}</div>
              <div className="text-xs text-green-200 mt-1">{cfg.avgGroupSize} 人结伴 × RM {cfg.avgSpend}</div>
            </div>
          </>
        ) : (
          <>
            {/* Single merchant: customers + revenue (wider) */}
            <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-2">预估触达客户数</div>
              <div className="text-4xl font-black text-gray-900">{Math.round(totalCustomers).toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">人次</div>
            </div>
            <div className="bg-green-600 rounded-2xl p-6 shadow-md text-center col-span-2">
              <div className="text-xs font-bold uppercase tracking-widest text-green-200 mb-2">预估营收贡献</div>
              <div className="text-5xl font-black text-white">RM {fmt(Math.round(revenue))}</div>
              <div className="text-xs text-green-200 mt-1">基于 {cfg.avgGroupSize} 人结伴 × RM {cfg.avgSpend}/人</div>
            </div>
          </>
        )}
      </div>

      {/* Formula breakdown */}
      <div className="bg-white/80 rounded-xl p-5 border border-green-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">换算逻辑</h4>
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="font-black text-gray-900 text-lg">{fmt(nonEng)}</div>
            <div className="text-xs text-gray-500">纯浏览（未互动）</div>
            <div className="text-xs text-green-600 font-bold mt-1">× {cfg.impressionConvRate}% 转化</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="font-black text-blue-700 text-lg">{fmt(saves)}</div>
            <div className="text-xs text-blue-500">收藏数</div>
            <div className="text-xs text-green-600 font-bold mt-1">× {cfg.saveConvRate}% 转化</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="font-black text-red-600 text-lg">{fmt(likesComments)}</div>
            <div className="text-xs text-red-400">点赞 + 评论</div>
            <div className="text-xs text-green-600 font-bold mt-1">× {cfg.likeConvRate}% 转化</div>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-mono bg-gray-50 rounded-lg px-4 py-2.5 leading-relaxed">
          总客数 ≈ ({cfg.impressionConvRate}% × {fmt(nonEng)}) + ({cfg.saveConvRate}% × {fmt(saves)}) + ({cfg.likeConvRate}% × {fmt(likesComments)}) ≈ {Math.round(totalCustomers)} 人
          {merchantCount > 1 && (
            <><br />本店客数 = {Math.round(totalCustomers)} ÷ {merchantCount} 家 ≈ {Math.round(perMerchantCustomers)} 人</>
          )}
          <br />预估营收 = {Math.round(perMerchantCustomers)} × {cfg.avgGroupSize}人 × RM {cfg.avgSpend} ≈ RM {fmt(Math.round(revenue))}
        </div>
        <p className="text-[10px] text-gray-400 mt-3">* 以上为基于行业经验的假设值，实际转化率因品类、价格带、活动质量而异。</p>
      </div>
    </section>
  );
}

// ── Main report view ─────────────────────────────────────────
export default function ReportViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const leadId = searchParams.get('leadId') ?? 'custom';

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [data, setData] = useState<CampaignReportData | null>(null);

  useEffect(() => {
    if (!id) return;
    supabaseDb.getCampaignById(id).then(setCampaign);
    // getAll tries Supabase first, falls back to localStorage
    reportDb.getAll(id).then(setData).catch(() => setData(reportDb.getLocal(id)));
  }, [id]);

  if (!campaign || !data) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-gray-500 text-sm">加载中…</div>
      </div>
    );
  }

  const mc: MerchantReportConfig = data.merchantConfigs[leadId] ?? DEFAULT_MERCHANT_CONFIG;
  const publishedKOLs = data.kols.filter(k => k.published);
  const soFar = !reportDb.allInsightsIn(data.kols);
  const merchantCount = (campaign.realFilledSlots + campaign.manualBoost) || 1;

  const postsPublished = publishedKOLs.length;
  const totalReach = reportDb.totalStat(data.kols, 'reach');
  const totalSaves = reportDb.totalStat(data.kols, 'bookmarks');
  const totalLC = reportDb.totalStat(data.kols, 'likes') + reportDb.totalStat(data.kols, 'comments');

  const sortedByReach = [...publishedKOLs]
    .map(k => ({ kol: k, stats: reportDb.getBestStats(k) }))
    .filter(x => x.stats && x.stats.reach > 0)
    .sort((a, b) => (b.stats?.reach ?? 0) - (a.stats?.reach ?? 0));
  const top3 = sortedByReach.slice(0, 3);

  const reportDate = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white py-8 print:py-0">
      {/* Print toolbar (hidden when printing) */}
      <div className="no-print max-w-[960px] mx-auto px-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-bold text-lg">报告预览</h1>
          <p className="text-gray-500 text-sm">点击右侧按钮导出 PDF，选择"另存为 PDF"即可</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-brand text-bg-main font-bold text-sm hover:scale-[1.03] active:scale-[0.97] transition-all shadow-lg cursor-pointer"
        >
          <Printer className="w-4 h-4" strokeWidth={2.5} />
          打印 / 导出 PDF
        </button>
      </div>

      {/* ── Report document ── */}
      <div id="report" className="max-w-[960px] mx-auto px-4 print:px-0 space-y-4">

        {/* ── Cover header ── */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm print:rounded-none print-card">
          <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-400" />
          <div className="px-8 py-6">
            {/* Top row: brand badge + company info */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-green-600">红薯榜单</div>
                  <div className="text-[10px] text-gray-400">小红书活动效果报告</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {mc.displayCompanyName && <div className="font-black text-gray-900 text-base leading-tight">{mc.displayCompanyName}</div>}
                {mc.displayPicName && <div className="text-xs text-gray-500 mt-0.5">负责人：{mc.displayPicName}</div>}
                <div className="text-xs text-gray-400 mt-1">{reportDate}</div>
                {soFar && (
                  <div className="mt-1.5 inline-flex items-center px-2 py-0.5 bg-amber-50 rounded-lg border border-amber-200">
                    <span className="text-[10px] text-amber-600 font-bold">进行中 · 数据持续更新</span>
                  </div>
                )}
              </div>
            </div>
            {/* Campaign title + tags */}
            <h1 className="text-2xl font-black text-gray-900 leading-tight mb-3">{campaign.title}</h1>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">{campaign.category}</span>
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">{campaign.location}</span>
              <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">{campaign.audience}</span>
            </div>
          </div>
        </div>

        {/* ── Tier 1 metrics ── */}
        <section className="report-section print:pt-8">
          <div className="flex items-center gap-3 mb-4 no-print">
            <h2 className="text-gray-700 font-bold text-lg">核心数据</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="总发布帖数"
              value={postsPublished}
              accent="text-green-600"
              sub={`共 ${data.kols.length} 位博主`}
            />
            <MetricCard
              label={soFar ? "累计曝光量" : "总曝光量"}
              value={totalReach}
              soFar={soFar && totalReach > 0}
              accent="text-blue-500"
              sub="所有帖子浏览量之和"
            />
            <MetricCard
              label={soFar ? "累计收藏数" : "总收藏数"}
              value={totalSaves}
              soFar={soFar && totalSaves > 0}
              accent="text-indigo-500"
              sub="Saves — 高意向信号"
            />
            <MetricCard
              label={soFar ? "累计点赞+评论" : "总点赞+评论"}
              value={totalLC}
              soFar={soFar && totalLC > 0}
              accent="text-pink-500"
              sub="互动量综合"
            />
          </div>
        </section>

        {/* ── Top 3 posts ── */}
        {top3.length > 0 && (
          <section className="report-section print:pt-6 print:break-after-page">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-yellow-400 rounded-full" />
              <h2 className="text-lg font-black text-gray-900">最佳帖子 Top 3</h2>
            </div>
            <div className="no-print text-xs text-gray-500 mb-3 bg-white rounded-lg px-3 py-1.5 inline-block border border-gray-100">
              按曝光量排列 · 🔥 = 高热帖子（曝光 &gt;300 或 点赞+收藏 &gt;100）
            </div>
            <div className={`grid gap-4 ${top3.length === 1 ? 'grid-cols-1 max-w-xs' : top3.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {top3.map((x, i) => (
                <TopPostCard key={x.kol.id} kol={x.kol} rank={i} stats={x.stats!} />
              ))}
            </div>
          </section>
        )}

        {/* ── Individual posts ── */}
        {publishedKOLs.length > 0 && (
          <section className="report-section print:pt-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-green-500 rounded-full" />
              <h2 className="text-xl font-black text-gray-900">全部帖子明细</h2>
            </div>
            <div className="no-print text-sm text-gray-600 mb-4 bg-white rounded-xl px-4 py-2 inline-block border border-gray-100">
              使用最新可用周期数据（28天 &gt; 14天 &gt; 7天）
            </div>
            <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
              {publishedKOLs
                .filter(k => reportDb.getBestStats(k))
                .sort((a, b) => (reportDb.getBestStats(b)?.reach ?? 0) - (reportDb.getBestStats(a)?.reach ?? 0))
                .map(kol => <PostCard key={kol.id} kol={kol} />)}
            </div>
            {publishedKOLs.some(k => !reportDb.getBestStats(k)) && (
              <p className="text-xs text-gray-400 mt-3">
                * {publishedKOLs.filter(k => !reportDb.getBestStats(k)).length} 位博主尚未提交数据，待提交后将显示于此。
              </p>
            )}
          </section>
        )}

        {/* ── ROI section ── */}
        {mc.showMerchantMetrics && totalReach > 0 && (
          <section className="report-section print:pt-6 print:break-before-page">
            <ROISection
              reach={totalReach}
              saves={totalSaves}
              likesComments={totalLC}
              cfg={mc}
              merchantCount={merchantCount}
            />
          </section>
        )}

        {/* Footer */}
        <div className="bg-white rounded-2xl px-10 py-5 flex items-center justify-between border border-gray-100 shadow-sm print:rounded-none">
          <div className="text-xs text-gray-400">此报告由红薯榜单（Adtron）自动生成 · {reportDate}</div>
          <div className="text-xs text-gray-400 font-mono">{id.slice(0, 8).toUpperCase()}</div>
        </div>

        <div className="h-8 no-print" />
      </div>
    </div>
  );
}
