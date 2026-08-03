// Campaign report data — localStorage (instant) + Supabase (durable)

import { supabase } from './supabaseClient';

export interface KOLStats {
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number; // saves
}

export interface KOL {
  id: string;
  name: string;
  handle: string;
  profilePicUrl: string;
  postCoverUrl: string;
  draftCompleted: boolean;
  draftCompletedDate: string;
  draftApproved: boolean;
  draftApprovedDate: string;
  published: boolean;
  publishedDate: string;
  insightSubmitted: boolean;
  insightSubmittedDate: string;
  stats7: KOLStats | null;
  stats14: KOLStats | null;
  stats28: KOLStats | null;
}

export interface MerchantReportConfig {
  displayCompanyName: string;
  displayPicName: string;
  showMerchantMetrics: boolean;
  avgSpend: number;
  avgGroupSize: number;
  saveConvRate: number;
  likeConvRate: number;
  impressionConvRate: number;
}

export interface CampaignReportData {
  campaignId: string;
  kols: KOL[];
  merchantConfigs: Record<string, MerchantReportConfig>; // keyed by leadId or 'custom'
  updatedAt: string;
}

export function newKOL(): KOL {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name: '', handle: '', profilePicUrl: '', postCoverUrl: '',
    draftCompleted: false, draftCompletedDate: '',
    draftApproved: false, draftApprovedDate: '',
    published: false, publishedDate: '',
    insightSubmitted: false, insightSubmittedDate: '',
    stats7: null, stats14: null, stats28: null,
  };
}

export function emptyStats(): KOLStats {
  return { reach: 0, likes: 0, comments: 0, shares: 0, bookmarks: 0 };
}

export const DEFAULT_MERCHANT_CONFIG: MerchantReportConfig = {
  displayCompanyName: '',
  displayPicName: '',
  showMerchantMetrics: false,
  avgSpend: 30,
  avgGroupSize: 2,
  saveConvRate: 30,
  likeConvRate: 5,
  impressionConvRate: 1,
};

const LS_KEY = (id: string) => `redlist_report_${id}`;

function lsGet(campaignId: string): CampaignReportData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_KEY(campaignId));
    return raw ? (JSON.parse(raw) as CampaignReportData) : null;
  } catch { return null; }
}

function lsSet(data: CampaignReportData): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_KEY(data.campaignId), JSON.stringify(data)); } catch {}
}

export const reportDb = {
  // Synchronous — reads localStorage only. Use for immediate UI init.
  getLocal: (campaignId: string): CampaignReportData =>
    lsGet(campaignId) ?? emptyReport(campaignId),

  // Async — tries Supabase first (authoritative), falls back to localStorage.
  getAll: async (campaignId: string): Promise<CampaignReportData> => {
    try {
      const { data, error } = await supabase
        .from('campaign_reports')
        .select('data')
        .eq('campaign_id', campaignId)
        .single();
      if (!error && data?.data) {
        const report = data.data as CampaignReportData;
        lsSet(report); // keep localStorage in sync
        return report;
      }
    } catch {}
    return lsGet(campaignId) ?? emptyReport(campaignId);
  },

  // Writes localStorage immediately, then syncs to Supabase.
  setAll: async (reportData: CampaignReportData): Promise<{ supabaseSynced: boolean }> => {
    const withTs = { ...reportData, updatedAt: new Date().toISOString() };
    lsSet(withTs);
    try {
      const { error } = await supabase
        .from('campaign_reports')
        .upsert(
          { campaign_id: withTs.campaignId, data: withTs, updated_at: withTs.updatedAt },
          { onConflict: 'campaign_id' },
        );
      if (error) throw error;
      return { supabaseSynced: true };
    } catch {
      return { supabaseSynced: false };
    }
  },

  getBestStats: (kol: KOL): KOLStats | null =>
    kol.stats28 ?? kol.stats14 ?? kol.stats7 ?? null,

  getBestPeriodLabel: (kol: KOL): string => {
    if (kol.stats28) return '28天';
    if (kol.stats14) return '14天';
    if (kol.stats7) return '7天';
    return '';
  },

  allInsightsIn: (kols: KOL[]): boolean => {
    const pub = kols.filter(k => k.published);
    return pub.length > 0 && pub.every(k => k.stats28 !== null);
  },

  totalStat: (kols: KOL[], field: keyof KOLStats): number =>
    kols
      .filter(k => k.published)
      .reduce((acc, k) => {
        const s = k.stats28 ?? k.stats14 ?? k.stats7;
        return acc + (s ? s[field] : 0);
      }, 0),

  estimateTotalCustomers: (
    reach: number, saves: number, likesComments: number,
    cfg: MerchantReportConfig,
  ): number => {
    const nonEng = Math.max(0, reach - saves - likesComments);
    return (
      (cfg.impressionConvRate / 100) * nonEng +
      (cfg.saveConvRate / 100) * saves +
      (cfg.likeConvRate / 100) * likesComments
    );
  },

  estimateRevenue: (
    reach: number, saves: number, likesComments: number,
    cfg: MerchantReportConfig,
    merchantCount: number = 1,
  ): number => {
    const nonEng = Math.max(0, reach - saves - likesComments);
    const totalCustomers =
      (cfg.impressionConvRate / 100) * nonEng +
      (cfg.saveConvRate / 100) * saves +
      (cfg.likeConvRate / 100) * likesComments;
    const perMerchant = merchantCount > 1 ? totalCustomers / merchantCount : totalCustomers;
    return perMerchant * cfg.avgGroupSize * cfg.avgSpend;
  },
};

function emptyReport(campaignId: string): CampaignReportData {
  return { campaignId, kols: [], merchantConfigs: {}, updatedAt: '' };
}
