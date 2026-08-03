import { supabase } from './supabaseClient';

export const FAQ_CATEGORIES = [
  "关于红薯榜单",
  "合作模式与流程",
  "博主与内容",
  "费用与支付",
  "效果与报告",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  displayStatus: boolean;
  sortOrder: number;
  createdAt: string;
}

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_status: boolean;
  sort_order: number;
  created_at: string;
};

const rowToFaq = (row: FaqRow): FAQ => ({
  id: row.id,
  question: row.question,
  answer: row.answer,
  category: row.category as FaqCategory,
  displayStatus: row.display_status,
  sortOrder: row.sort_order ?? 0,
  createdAt: row.created_at,
});

export const faqDb = {
  getFaqs: async (): Promise<FAQ[]> => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) { console.error('faqDb.getFaqs:', error); return []; }
    return (data as FaqRow[]).map(rowToFaq);
  },

  getFaqsForDisplay: async (): Promise<FAQ[]> => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('display_status', true)
      .order('sort_order', { ascending: true });
    if (error) { console.error('faqDb.getFaqsForDisplay:', error); return []; }
    return (data as FaqRow[]).map(rowToFaq);
  },

  addFaq: async (faq: Omit<FAQ, 'id' | 'sortOrder' | 'createdAt'>): Promise<FAQ> => {
    const { data: existing } = await supabase.from('faqs').select('sort_order').order('sort_order', { ascending: false }).limit(1).single();
    const nextOrder = existing ? (existing as { sort_order: number }).sort_order + 1 : 1;
    const { data, error } = await supabase
      .from('faqs')
      .insert([{
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        display_status: faq.displayStatus,
        sort_order: nextOrder,
      }])
      .select()
      .single();
    if (error) throw error;
    return rowToFaq(data as FaqRow);
  },

  updateFaq: async (id: string, updates: Partial<Omit<FAQ, 'id' | 'createdAt'>>): Promise<FAQ | null> => {
    const dbUpdates: Partial<FaqRow> = {};
    if (updates.question !== undefined) dbUpdates.question = updates.question;
    if (updates.answer !== undefined) dbUpdates.answer = updates.answer;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.displayStatus !== undefined) dbUpdates.display_status = updates.displayStatus;
    if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;

    const { data, error } = await supabase
      .from('faqs')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error('faqDb.updateFaq:', error); return null; }
    return rowToFaq(data as FaqRow);
  },

  deleteFaq: async (id: string): Promise<void> => {
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) throw error;
  },
};
