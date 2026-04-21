// mockDb.ts
// Handles LocalStorage persistence to simulate a Database

export const MALAYSIA_LOCATIONS = [
  "马来西亚全境 (Whole Malaysia)",
  "雪隆区 (Klang Valley)",
  "吉隆坡 (Kuala Lumpur)",
  "旧巴生路 (Old Klang Road)",
  "古仔喇嘛 (Kuchai Lama)",
  "华联花园 (OUG)",
  "蕉赖 (Cheras)",
  "蒲种 (Puchong)",
  "梳邦再也 (Subang Jaya)",
  "八打灵再也 (Petaling Jaya / PJ)",
  "大城堡 (Sri Petaling)",
  "甲洞 (Kepong)",
  "双威 (Sunway)",
  "白沙罗 (Damansara)",
  "哥打白沙罗 (Kota Damansara)",
  "斯里白沙罗 (Bandar Sri Damansara)",
  "蒂沙公园城市 (Desa Park City)",
  "阿拉白沙罗 (Ara Damansara)",
  "万达镇 (Bandar Utama)",
  "武吉加里尔 (Bukit Jalil)",
  "满家乐 (Mont Kiara)",
  "孟沙 (Bangsar)",
  "谷中城 (Mid Valley)",
  "布城 (Putrajaya)",
  "赛城 (Cyberjaya)",
  "莎阿南 (Shah Alam)",
  "巴生 (Klang)",
  "加影 (Kajang)",
  "芙蓉 (Seremban)",
  "云顶高原 (Genting Highlands)",
  "金马仑高原 (Cameron Highlands)",
  "怡保 (Ipoh)",
  "实兆远 (Sitiawan)",
  "槟城 (Penang)",
  "马六甲 (Melaka)",
  "新山 (Johor Bahru)",
  "古晋 (Kuching)",
  "亚庇 (Kota Kinabalu)",
  "关丹 (Kuantan)"
];

export interface Campaign {
  id: string;
  title: string;
  category: string;
  location: string;
  audience: string;
  description: string;
  targetSlots: number;
  realFilledSlots: number; // The actual number of businesses that signed up
  manualBoost: number; // Manual operations override
  status: "recruiting" | "full" | "active" | "completed";
  image: string;
  posters: string[];
  titleExamples?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface MerchantUser {
  id: string;
  email: string;
  password?: string;
  companyName: string;
  picName: string;
  phone: string;
  createdAt: string;
}

export interface UserLead {
  id: string;
  companyName: string;
  phone: string;
  picName: string;
  campaignId: string;
  createdAt: string;
}

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-1",
    title: "吉隆坡 20 家必吃 Nasi Lemak 终极榜单",
    category: "美食探店, 生活服务",
    location: "吉隆坡",
    audience: "年轻人, 美食爱好者, 本地居民",
    description: "聚集 20 位吉隆坡本土头部探店博主，全网铺发探店合集。打造全城最火爆的椰浆饭指南，精准引流吃货人群。",
    targetSlots: 20,
    realFilledSlots: 10,
    manualBoost: 8,
    status: "recruiting",
    image: "https://images.unsplash.com/photo-1626804475297-41609ea0f4eb?auto=format&fit=crop&q=80&w=800&h=500",
    posters: [
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400&h=600",
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: "camp-2",
    title: "雪隆区周末小众 Camping 营地推荐",
    category: "休闲好去处, 旅游打卡",
    location: "雪隆区",
    audience: "家庭, 年轻人, 旅行爱好者",
    description: "迎合近期大热的 Glamping 露营风潮，联合 20 位户外生活方式小红书博主，为你定制高端露营引流盛宴。",
    targetSlots: 20,
    realFilledSlots: 12,
    manualBoost: 0,
    status: "recruiting",
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=800&h=500",
    posters: [],
    createdAt: new Date().toISOString()
  },
  {
    id: "camp-3",
    title: "KL 秋冬绝美 OOTD 独立设计师品牌打卡",
    category: "时尚潮流",
    location: "吉隆坡",
    audience: "年轻人, 时尚美妆爱好者",
    description: "让你的独立时装店成为全网潮人打卡地。高质量颜值博主矩阵为你带量，提升品牌势能。",
    targetSlots: 20,
    realFilledSlots: 20,
    manualBoost: 0,
    status: "completed",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800&h=500",
    posters: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// 15 Random mock leads
const DEFAULT_LEADS: UserLead[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `lead-${i}`,
  companyName: `测试商家 ${i+1} 号`,
  phone: `+60 12 345 678${i%10}`,
  picName: `Mr. Wong ${i}`,
  campaignId: i % 2 === 0 ? "camp-1" : "camp-2",
  createdAt: new Date(Date.now() - 86400000 * (i%10)).toISOString()
}));

export const mockDb = {
  getCampaigns: (): Campaign[] => {
    if (typeof window === 'undefined') return [];
    if (!localStorage.getItem('redlist_campaigns_v3')) {
      localStorage.setItem('redlist_campaigns_v3', JSON.stringify(DEFAULT_CAMPAIGNS));
    }
    return JSON.parse(localStorage.getItem('redlist_campaigns_v3') || '[]');
  },

  saveCampaigns: (campaigns: Campaign[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('redlist_campaigns_v3', JSON.stringify(campaigns));
      } catch (e) {
        console.error(e);
        alert("系统警告：保存失败！您的浏览器本地存储(LocalStorage)已满，可能是因为上传的图片数据过大。请刷新页面，重新使用经过压缩的小体积图片，或等待后续连接云数据库！");
      }
    }
  },

  getLeads: (): UserLead[] => {
    if (typeof window === 'undefined') return [];
    if (!localStorage.getItem('redlist_leads_v3')) {
      localStorage.setItem('redlist_leads_v3', JSON.stringify(DEFAULT_LEADS));
    }
    return JSON.parse(localStorage.getItem('redlist_leads_v3') || '[]');
  },

  getStats: () => {
    const leads = mockDb.getLeads();
    const campaigns = mockDb.getCampaigns();
    return {
      totalUsers: mockDb.getMerchants().length || leads.length, // Unique user apply metric
      runningCampaigns: campaigns.filter(c => c.status === 'recruiting').length,
      completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
      pendingLeads: Math.floor(leads.length / 2) // Just mock roughly half are pending
    }
  },

  // Auth & Merchant Management
  getMerchants: (): MerchantUser[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('redlist_merchants') || '[]');
  },

  saveMerchants: (merchants: MerchantUser[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('redlist_merchants', JSON.stringify(merchants));
    }
  },

  getCurrentMerchant: (): MerchantUser | null => {
    if (typeof window === 'undefined') return null;
    const current = localStorage.getItem('redlist_current_merchant');
    return current ? JSON.parse(current) : null;
  },

  setCurrentMerchant: (merchant: MerchantUser | null) => {
    if (typeof window !== 'undefined') {
      if (merchant) {
         localStorage.setItem('redlist_current_merchant', JSON.stringify(merchant));
      } else {
         localStorage.removeItem('redlist_current_merchant');
      }
    }
  },
  
  registerMerchant: (data: Omit<MerchantUser, 'id' | 'createdAt'>) => {
    const merchants = mockDb.getMerchants();
    if (merchants.find(m => m.email === data.email)) {
      throw new Error("该邮箱已被注册！");
    }
    const newUser: MerchantUser = {
      ...data,
      id: `merchant-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    merchants.push(newUser);
    mockDb.saveMerchants(merchants);
    mockDb.setCurrentMerchant(newUser);
    return newUser;
  },

  loginMerchant: (email: string, password?: string) => {
    const merchants = mockDb.getMerchants();
    const user = merchants.find(m => m.email === email && m.password === password);
    if (!user) {
      throw new Error("邮箱或密码错误");
    }
    mockDb.setCurrentMerchant(user);
    return user;
  },
  
  logoutMerchant: () => {
    mockDb.setCurrentMerchant(null);
  }
};
