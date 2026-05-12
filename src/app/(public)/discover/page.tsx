"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Users as UsersIcon, Grid, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabaseDb } from "@/lib/supabaseDb";
import { Campaign, MALAYSIA_LOCATIONS } from "@/lib/mockDb";

const CATEGORIES = ["全部榜单", "美食探店", "休闲好去处", "时尚潮流", "旅游打卡", "生活服务"];
const LOCATIONS = ["全部地点", ...MALAYSIA_LOCATIONS];
const AUDIENCES = [
  "全部受众", "年轻人", "家庭", "美食爱好者", "旅行爱好者", "白领上班族", 
  "本地居民", "学生党", "游客/外地人", "时尚美妆爱好者", 
  "健康养生者", "数码科技控", "文艺青年"
];
const STATUSES = [
  { label: "全部阶段", value: "all" },
  { label: "招募中", value: "recruiting" },
  { label: "已满额", value: "full" },
  { label: "进行中", value: "active" },
  { label: "已归档", value: "completed" }
];

export default function DiscoverPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("全部榜单");
  const [activeLocation, setActiveLocation] = useState("全部地点");
  const [activeAudience, setActiveAudience] = useState("全部受众");
  const [activeStatus, setActiveStatus] = useState("recruiting");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabaseDb.getCampaigns().then(data => {
      setCampaigns(data);
      setIsLoading(false);
    });
  }, []);

  const filteredCampaigns = campaigns.filter(camp => {
    const isFull = camp.realFilledSlots + camp.manualBoost >= camp.targetSlots;
    const computedStatus = (camp.status === 'recruiting' && isFull) ? 'full' : camp.status;

    if (activeStatus !== "all" && computedStatus !== activeStatus) return false;
    
    if (activeCategory !== "全部榜单" && (!camp.category || !camp.category.includes(activeCategory))) return false;
    if (activeLocation !== "全部地点" && camp.location !== activeLocation) return false;
    if (activeAudience !== "全部受众" && (!camp.audience || !camp.audience.includes(activeAudience))) return false;
    if (searchQuery && !camp.title.includes(searchQuery) && !camp.description.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-10 h-full pb-20">
      
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">全部营销榜单</h1>
        <p className="text-text-secondary text-lg">根据你的行业类目和目标客群，找到最适合你的本地红薯营销矩阵计划。</p>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col gap-6 bg-bg-surface p-6 rounded-3xl border border-white/5">
        
        {/* Status Filter Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar bg-bg-main p-1.5 rounded-2xl w-fit border border-white/5">
          {STATUSES.map(st => (
            <button
               key={st.value}
               onClick={() => setActiveStatus(st.value)}
               className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                 activeStatus === st.value 
                 ? 'bg-brand text-bg-main shadow-[0_0_15px_rgba(198,248,36,0.3)]'
                 : 'text-text-secondary hover:text-white hover:bg-white/5'
               }`}
            >
               {st.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center text-text-secondary mr-2 text-sm font-medium">
            <Grid className="w-4 h-4 mr-2" /> 榜单类目:
          </div>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat 
                ? 'bg-brand text-bg-main shadow-[0_0_15px_rgba(198,248,36,0.3)]' 
                : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
           <div className="relative flex-1 xl:w-40">
             <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
             <select 
               value={activeLocation}
               onChange={(e) => setActiveLocation(e.target.value)}
               className="w-full bg-bg-main border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand/50 appearance-none cursor-pointer"
             >
               {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
             </select>
           </div>
           
           <div className="relative flex-1 xl:w-56">
             <UsersIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
             <select 
               value={activeAudience}
               onChange={(e) => setActiveAudience(e.target.value)}
               className="w-full bg-bg-main border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand/50 appearance-none cursor-pointer"
             >
               {AUDIENCES.map(aud => <option key={aud} value={aud}>{aud}</option>)}
             </select>
           </div>
        </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索特定的活动名称或标签..." 
          className="w-full h-14 bg-bg-surface rounded-2xl pl-14 pr-6 text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 border border-white/5 transition-all text-lg"
        />
      </div>

      {/* Campaigns Grid */}
      <div>
         <div className="text-sm font-medium text-text-secondary mb-6">
           共找到 {filteredCampaigns.length} 个进行中的榜单计划
         </div>

         {isLoading ? (
           <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-bg-surface rounded-3xl border border-white/5">
             <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">正在从云存储检索榜单...</h3>
           </div>
         ) : filteredCampaigns.length === 0 ? (
           <div className="w-full py-20 flex flex-col items-center justify-center text-center bg-bg-surface rounded-3xl border border-white/5 border-dashed">
             <Search className="w-12 h-12 text-text-secondary/30 mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">暂无匹配活动</h3>
             <p className="text-text-secondary">你可以尝试切换其他分类或清除筛选条件。</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCampaigns.map((camp, index) => {
              const totalDisplayedSlots = camp.realFilledSlots + camp.manualBoost;
              const progress = Math.min(100, Math.round((totalDisplayedSlots / camp.targetSlots) * 100));
              const isFull = totalDisplayedSlots >= camp.targetSlots;

              return (
                <motion.div
                  key={camp.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="group relative flex flex-col bg-bg-surface rounded-[2rem] overflow-hidden border border-white/5 hover:border-brand/30 transition-all hover:shadow-[0_0_40px_rgba(198,248,36,0.15)] duration-500"
                >
                  {/* Image Wrap */}
                  <Link href={`/campaign/${camp.id}`} className="relative h-64 w-full overflow-hidden block">
                    <div className="absolute top-5 left-5 z-10 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-white border border-white/10 uppercase tracking-wider">
                      {camp.category}
                    </div>
                    <img 
                      src={camp.image} 
                      alt={camp.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent opacity-90" />
                  </Link>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-1 relative">
                    <Link href={`/campaign/${camp.id}`} className="block flex-1">
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-brand transition-colors line-clamp-2 leading-snug">
                        {camp.title}
                      </h3>
                      <p className="text-[15px] text-text-secondary line-clamp-3 mb-8 leading-relaxed">
                        {camp.description}
                      </p>
                    </Link>

                    <div className="mt-auto">
                      <div className="flex items-end justify-between mb-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">{totalDisplayedSlots}</span>
                          <span className="text-sm font-medium text-text-secondary">/ {camp.targetSlots} 席位</span>
                        </div>
                        <div className="flex items-center text-sm font-bold text-text-primary">
                          {camp.status === 'active' ? (
                             <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full"><Activity className="w-4 h-4"/> 进行中</div>
                          ) : camp.status === 'completed' ? (
                             <div className="flex items-center gap-1.5 text-text-secondary bg-white/5 px-3 py-1 rounded-full">已完成</div>
                          ) : !isFull ? (
                             <div className="flex items-center gap-1.5 text-brand bg-brand/10 px-3 py-1 rounded-full"><Activity className="w-4 h-4"/> 招募中</div>
                          ) : (
                             <div className="flex items-center gap-1.5 text-gray-400 bg-gray-500/10 px-3 py-1 rounded-full">已满额</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden mb-6 relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className={`absolute top-0 left-0 h-full rounded-full ${isFull ? 'bg-gray-500' : 'bg-brand shadow-[0_0_15px_rgba(198,248,36,0.8)]'}`}
                        />
                      </div>
                      
                      <Link 
                        href={`/campaign/${camp.id}`}
                        className={`w-full py-4 rounded-xl flex items-center justify-center font-bold text-[15px] transition-all ${
                          isFull 
                          ? 'bg-white/5 text-text-secondary cursor-not-allowed' 
                          : 'bg-white/5 border border-white/5 text-white hover:bg-brand hover:text-bg-main hover:border-transparent hover:shadow-[0_0_20px_rgba(198,248,36,0.3)]'
                        }`}
                      >
                        {isFull ? '名额已达上限' : '抢占首批席位'}
                        {!isFull && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
           </div>
         )}
      </div>

    </div>
  );
}
