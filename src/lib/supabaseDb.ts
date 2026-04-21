import { supabase } from './supabaseClient';
import { Campaign, MerchantUser, UserLead } from './mockDb';

export const supabaseDb = {
  getCampaigns: async (): Promise<Campaign[]> => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) {
      console.error("Error fetching campaigns:", error);
      return [];
    }
    return data as Campaign[];
  },

  getCampaignById: async (id: string): Promise<Campaign | null> => {
    if (!id) return null;
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error("Error fetching campaign by id:", error);
      return null;
    }
    return data as Campaign;
  },

  saveCampaign: async (campaign: Omit<Campaign, 'id' | 'createdAt'>): Promise<Campaign | null> => {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaign])
      .select()
      .single();
    if (error) {
      console.error("Error saving campaign:", error);
      throw error;
    }
    return data as Campaign;
  },

  updateCampaign: async (id: string, updates: Partial<Campaign>): Promise<Campaign | null> => {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error("Error updating campaign:", error);
      throw error;
    }
    return data as Campaign;
  },

  uploadImage: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `posters/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('campaign-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('campaign-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  getLeads: async (): Promise<UserLead[]> => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) {
      console.error("Error fetching leads:", error);
      return [];
    }
    return data as UserLead[];
  },

  addLead: async (lead: Omit<UserLead, 'id' | 'createdAt'>): Promise<UserLead | null> => {
     const { data, error } = await supabase
       .from('leads')
       .insert([lead])
       .select()
       .single();
     if (error) {
       console.error("Error inserting lead:", error);
       throw error;
     }
     return data as UserLead;
  },

  getStats: async () => {
    const { count: campaignsCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'recruiting');
      
    const { count: completedCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { count: leadsCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
      
    const { count: usersCount } = await supabase
      .from('merchants')
      .select('*', { count: 'exact', head: true });

    return {
      totalUsers: usersCount || 0,
      runningCampaigns: campaignsCount || 0,
      completedCampaigns: completedCount || 0,
      pendingLeads: leadsCount || 0
    };
  },

  registerMerchant: async (data: Omit<MerchantUser, 'id' | 'createdAt'>): Promise<MerchantUser> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password!,
    });
    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("注册失败，请稍后再试");

    const { data: newUser, error } = await supabase
      .from('merchants')
      .insert([{
        user_id: authData.user.id,
        email: data.email,
        companyName: data.companyName,
        picName: data.picName,
        phone: data.phone,
      }])
      .select()
      .single();
    if (error) throw error;

    if (typeof window !== 'undefined')
      localStorage.setItem('redlist_current_merchant', JSON.stringify(newUser));
    return newUser as MerchantUser;
  },

  loginMerchant: async (email: string, password?: string): Promise<MerchantUser> => {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: password!,
    });
    if (authError) throw new Error("邮箱或密码错误");

    const { data: user, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !user) throw new Error("找不到账户信息");

    if (typeof window !== 'undefined')
      localStorage.setItem('redlist_current_merchant', JSON.stringify(user));
    return user as MerchantUser;
  },

  getCurrentMerchant: (): MerchantUser | null => {
    if (typeof window === 'undefined') return null;
    const current = localStorage.getItem('redlist_current_merchant');
    return current ? JSON.parse(current) : null;
  },

  logoutMerchant: async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined')
      localStorage.removeItem('redlist_current_merchant');
  }
};
