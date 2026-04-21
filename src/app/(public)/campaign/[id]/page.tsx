"use client";

import { useState, useEffect } from "react";
import { Sparkles, Users, ArrowRight, Share2, AlertCircle, ArrowLeft, Activity, X, Copy, CheckCircle2, TrendingUp, Plus, Minus, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseDb } from "@/lib/supabaseDb";
import { Campaign, UserLead, MerchantUser } from "@/lib/mockDb";
import { faqDb, FAQ } from "@/lib/faqDb";
import { titleExamplesDb } from "@/lib/titleExamplesDb";

export default function CampaignDetail() {
  const params = useParams();
  const id = params.id as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [displayFaqs, setDisplayFaqs] = useState<FAQ[]>([]);
  const [titleExamples, setTitleExamples] = useState<string[]>([]);

  // Auth & Form states
  const [currentUser, setCurrentUser] = useState<MerchantUser | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [picName, setPicName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    supabaseDb.getCampaignById(id).then(found => {
      if (found) {
         setCampaign(found);
      }
      setCurrentUser(supabaseDb.getCurrentMerchant());
      setLoading(false);
    });
    setDisplayFaqs(faqDb.getFaqsForDisplay());
    setTitleExamples(titleExamplesDb.get(id));
  }, [id]);

  if (loading) return <div className="text-white p-20 text-center">正在加载榜单数据...</div>;
  if (!campaign) return <div className="text-white p-20 text-center">找不到相关的榜单活动。</div>;

  const totalDisplayedSlots = campaign.realFilledSlots + campaign.manualBoost;
  const isFull = totalDisplayedSlots >= campaign.targetSlots || ['completed', 'full', 'active'].includes(campaign.status);
  const progress = Math.min(100, (totalDisplayedSlots / campaign.targetSlots) * 100);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    let merchantInfo = currentUser;

    // Guest Signup flow
    if (!merchantInfo) {
      if (!companyName || !phone || !picName || !email || !password || !confirmPassword) {
         alert("请完整填写商家入驻注册资料");
         return;
      }
      if (password !== confirmPassword) {
         alert("系统提示：两次输入的密码不一致，请重新核对。");
         return;
      }
      try {
        merchantInfo = await supabaseDb.registerMerchant({ companyName, phone, picName, email, password });
        setCurrentUser(merchantInfo);
      } catch (err: any) {
        alert(err.message || "注册失败，请检查邮箱是否已存在");
        return;
      }
    }

    const newLead = {
       companyName: merchantInfo.companyName,
       phone: merchantInfo.phone.startsWith('+60') ? merchantInfo.phone : `+60 ${merchantInfo.phone}`,
       picName: merchantInfo.picName,
       campaignId: campaign.id
    };

    try {
      // Save lead
      await supabaseDb.addLead(newLead);

      // Update campaign filled slots
      const updatedCamp = await supabaseDb.updateCampaign(campaign.id, {
        realFilledSlots: campaign.realFilledSlots + 1
      });

      if (updatedCamp) {
        if (updatedCamp.realFilledSlots + updatedCamp.manualBoost >= updatedCamp.targetSlots && updatedCamp.status === 'recruiting') {
           await supabaseDb.updateCampaign(campaign.id, { status: 'full' });
           updatedCamp.status = 'full';
        }
        setCampaign(updatedCamp);
      }

      setIsModalOpen(false);
      alert("申请已提交！我们的工作人员会联络你确认付款与资料对接。");
    } catch (e) {
      console.error(e);
      alert("提交失败，请联系管理员！");
    }
  };

  return (
    <div className="flex flex-col gap-10 h-full pb-20">
      {/* Back Navigation */}
      <div>
        <Link href="/discover" className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> 返回发现大厅
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Left Content Area */}
        <div className="flex-1 w-full space-y-12">
          
          {/* Banner */}
          <div className="relative w-full h-[350px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-bg-surface">
            <img 
              src={campaign.image} 
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/30 to-transparent opacity-90" />
            <div className="absolute bottom-6 left-6 md:left-8 flex flex-wrap items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-brand/20 backdrop-blur-md text-brand text-sm font-bold border border-brand/30">
                {campaign.category}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium border border-white/10">
                {campaign.location}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {campaign.title}
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed whitespace-pre-wrap">
              {campaign.description}
            </p>
          </div>

         {/* Target Audience Highlight */}
          <div className="bg-gradient-to-br from-bg-surface to-bg-main p-8 rounded-3xl border border-white/5">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-brand" />
                </div>
                <h2 className="text-2xl font-bold text-white">精准目标受众 (Target Audience)</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {campaign.audience.split(',').map(a => a.trim()).filter(Boolean).map((aud, idx) => {
                 const AUDIENCE_DESCRIPTIONS: Record<string, string> = {
                   "年轻人": "追逐新鲜事物，崇尚个性化表达，是产生品牌话题裂变的核心驱动力。",
                   "家庭": "注重性价比与实用价值，具备极高的消费忠诚度与决策权。",
                   "美食爱好者": "对本地新开餐厅和隐藏美食有着狂热的追求，吃货必打卡人群。",
                   "旅行爱好者": "热衷于探索小众景点与高颜值打卡地，强烈的周末出游需求。",
                   "白领上班族": "消费实力强劲，追求品质生活，偏好下班后的释放与高端体验。",
                   "本地居民": "深耕社区生活，习惯本地消费，为您带来长期的复购与口碑沉淀。",
                   "学生党": "网络活跃度极高，富有时间探索新店，也是极佳的社媒传播节点。",
                   "游客/外地人": "以攻略和榜单作为旅行消费指南，极易直接被小红书种草转化。",
                   "时尚美妆爱好者": "对颜值和审美有着极高要求，能为品牌贡献极为精美的打卡图文。",
                   "健康养生者": "注重成分与健康生活方式，偏好轻食、户外与高质量运动体验。",
                   "数码科技控": "热衷前沿科技和产品测评，对智能设备与高效工具有很高的付费意愿。",
                   "文艺青年": "热爱咖啡馆、艺术展与市集，容易被有故事、有情绪价值的品牌打动。"
                 };
                 
                 return (
                   <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-brand/30 transition-colors">
                     <div className="text-xl font-black text-brand mb-3">{aud}</div>
                     <p className="text-text-secondary leading-relaxed text-sm">
                       {AUDIENCE_DESCRIPTIONS[aud] || "我们的矩阵分发策略将专门投喂给这一垂直人群。通过大量的本地高质量博主同时造势，让你的品牌高密度渗透其信息流中。"}
                     </p>
                   </div>
                 );
               })}
             </div>
          </div>

         {/* Expected Outcome Posters */}
          {(campaign.posters && campaign.posters.length > 0) && (
            <div>
               <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                 <TrendingUp className="w-6 h-6 text-brand" />
                 预期内容成效预览
               </h2>
               <p className="text-text-secondary mb-8">
                 你的品牌将在这 20 篇高颜值的（包括图文）爆款清单中牢占据一席之地。
               </p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {campaign.posters.map((poster, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group">
                      <img src={poster} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={`Expected outcome ${i}`} />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Title Examples */}
          {titleExamples.length > 0 && (
            <div className="pt-8 border-t border-white/5">
              <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-3">
                <FileText className="w-6 h-6 text-brand" />
                标题范例
              </h2>
              <p className="text-text-secondary mb-8">
                以下是我们为商家打造的内容标题风格参考，展示了博主会以何种角度呈现您的品牌。
              </p>
              <div className="space-y-3">
                {titleExamples.map((title, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-bg-surface border border-white/[0.06] hover:border-brand/20 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-xs font-black flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-white text-sm font-medium leading-snug">{title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {displayFaqs.length > 0 && (
            <div className="pt-8 border-t border-white/5">
              <h2 className="text-2xl font-bold text-white mb-8">常见问题解答</h2>
              <div className="space-y-4">
                {displayFaqs.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? "bg-white/5" : "bg-transparent hover:bg-white/[0.02]"}`}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                        className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                      >
                        <span className="text-lg font-medium text-white">{faq.question}</span>
                        <span className="text-brand shrink-0 ml-4">
                          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </span>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-6 pb-6 text-text-secondary leading-relaxed whitespace-pre-line"
                          >
                            {faq.answer}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Action Sidebar (Sticky) */}
        <div className="w-full lg:w-[400px] sticky top-28">
          <div className="bg-bg-surface rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Subtle glow effect behind card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 blur-[50px] -z-10 rounded-full" />
            
            <div className="flex justify-between items-end mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${(campaign.status === 'recruiting' || campaign.status === 'active') && !isFull ? 'bg-brand animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-white font-bold text-lg">
                  {campaign.status === 'active' ? "活动进行中" : 
                   campaign.status === 'completed' ? "已完成" : 
                   isFull || campaign.status === 'full' ? "已满额" : "招募中"}
                </span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">{totalDisplayedSlots} <span className="text-text-secondary text-lg font-medium">/ {campaign.targetSlots}</span></div>
                <div className="text-sm text-text-secondary mt-1">已被抢占席位</div>
              </div>
            </div>

            <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden mb-8 relative">
              <div 
                style={{ width: `${progress}%` }} 
                className={`absolute top-0 left-0 h-full rounded-full ${isFull ? 'bg-gray-500' : 'bg-brand shadow-[0_0_15px_rgba(198,248,36,0.6)]'}`}
              />
            </div>

            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between items-center text-text-primary p-3 rounded-xl bg-white/5">
                <span className="text-text-secondary">活动启动机制</span>
                <span className="font-medium text-brand flex items-center gap-1">席位满员 即刻执行</span>
              </div>
              <div className="flex justify-between items-center text-text-primary p-3 rounded-xl bg-white/5">
                <span className="text-text-secondary">内容形式</span>
                <span className="font-medium text-white">高质量图文</span>
              </div>
              <div className="flex justify-between items-center text-text-primary p-3 rounded-xl bg-white/5">
                <span className="text-text-secondary">分发策略</span>
                <span className="font-medium text-white">20位博主 矩阵宣发</span>
              </div>
            </div>

            <button 
              onClick={() => !isFull && setIsModalOpen(true)}
              disabled={isFull}
              className={`w-full h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all ${
                isFull 
                ? 'bg-white/10 text-text-secondary cursor-not-allowed' 
                : 'bg-brand hover:scale-[1.02] active:scale-[0.98] text-bg-main shadow-[0_0_20px_rgba(198,248,36,0.3)] cursor-pointer'
              }`}
            >
              {campaign.status === 'active' ? "招募已停止 (进行中)" : 
               campaign.status === 'completed' ? "活动已归档" : 
               isFull ? "名额已满" : "立即申请加入榜单"}
            </button>
            
            {!isFull && (
              <p className="text-xs text-text-secondary text-center mt-4 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" /> 目前已有 {totalDisplayedSlots} 位商家在此榜单内
              </p>
            )}

            <div className="w-full h-[1px] bg-white/5 my-6"></div>

            <button 
              onClick={handleShare}
              className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center justify-center text-sm font-medium cursor-pointer"
            >
              {copied ? (
                <><CheckCircle2 className="w-4 h-4 mr-2 text-green-400" /> 已复制链接</>
              ) : (
                <><Share2 className="w-4 h-4 mr-2" /> 分享给合伙人</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FOMO Application Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[540px] bg-bg-surface border border-white/10 rounded-3xl p-6 lg:p-7 shadow-2xl overflow-y-auto max-h-[95vh]"
            >
               {/* Modal Header */}
               <div className="flex justify-between items-start mb-5">
                 <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold mb-2 border border-brand/20">
                      仅剩最后 {Math.max(0, campaign.targetSlots - totalDisplayedSlots)} 个入局名额
                    </div>
                    <h3 className="text-xl font-bold text-white">提交入驻申请</h3>
                 </div>
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-white"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>

               {/* Form or One-click Apply */}
               {currentUser ? (
                  <div className="space-y-6">
                    <div className="bg-brand/10 border border-brand/20 p-5 rounded-xl">
                       <p className="text-text-secondary text-sm mb-2">当前登录身份：</p>
                       <div className="font-bold text-white text-xl">{currentUser.companyName}</div>
                       <div className="text-sm text-text-secondary mt-1">{currentUser.picName} ({currentUser.phone})</div>
                    </div>
                    <div className="text-sm text-blue-200 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl leading-relaxed">
                      💡 新活动报名不需重复填表。点击下方将直接一键使用此身份参与该营销榜单。
                    </div>
                    <button 
                      type="button" 
                      onClick={handleApply}
                      className="w-full h-14 mt-2 rounded-xl bg-brand hover:scale-[1.02] active:scale-[0.98] text-bg-main font-bold text-lg shadow-[0_0_20px_rgba(198,248,36,0.3)] transition-all"
                    >
                      一键快速报名
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { supabaseDb.logoutMerchant(); setCurrentUser(null); }}
                      className="w-full text-text-secondary hover:text-white text-sm text-center pt-2 transition-colors cursor-pointer"
                    >
                       切换账号 / 退出登录
                    </button>
                  </div>
               ) : (
               <form className="space-y-4">
                   <div className="space-y-1.5">
                     <label className="text-[13px] font-medium text-text-secondary">邮箱地址 (Login Email)</label>
                     <input 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       placeholder="用于登录与接收通知" 
                       className="w-full bg-bg-main border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors"
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                       <label className="text-[13px] font-medium text-text-secondary">登录密码 (Password)</label>
                       <input 
                         type="password" 
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         placeholder="设置账号密码" 
                         className="w-full bg-bg-main border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors"
                       />
                     </div>

                     <div className="space-y-1.5">
                       <label className="text-[13px] font-medium text-brand">确认密码 (Confirm)</label>
                       <input 
                         type="password" 
                         value={confirmPassword}
                         onChange={(e) => setConfirmPassword(e.target.value)}
                         placeholder="再次输入密码" 
                         className="w-full bg-brand/5 border border-brand/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors"
                       />
                     </div>
                   </div>

                   <div className="h-[1px] w-full bg-white/5 my-2"></div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                       <label className="text-[13px] font-medium text-text-secondary">店铺名称 (Company Name)</label>
                       <input 
                         type="text" 
                         value={companyName}
                         onChange={(e) => setCompanyName(e.target.value)}
                         placeholder="你的入局商家名称" 
                         className="w-full bg-bg-main border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors"
                       />
                     </div>

                     <div className="space-y-1.5">
                       <label className="text-[13px] font-medium text-text-secondary">负责人 (PIC Name)</label>
                       <input 
                         type="text" 
                         value={picName}
                         onChange={(e) => setPicName(e.target.value)}
                         placeholder="例如：Mr. Wang" 
                         className="w-full bg-bg-main border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors"
                       />
                     </div>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-[13px] font-medium text-text-secondary">联络电话 (支持 WhatsApp)</label>
                     <div className="flex gap-2">
                       <div className="w-14 bg-bg-main border border-white/10 rounded-xl px-0 py-2.5 text-white flex items-center justify-center text-sm font-medium">
                         +60
                       </div>
                       <input 
                         type="tel" 
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         placeholder="12 345 6789" 
                         className="flex-1 bg-bg-main border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors"
                       />
                     </div>
                   </div>
                   
                   <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed mt-2">
                     💡 <span className="font-bold">锁定席位:</span> 提交申请即完成注册并锁定名额。客户经理会尽快通过 WhatsApp 联系对接。
                   </div>

                   <button 
                     type="button" 
                     onClick={handleApply}
                     className="w-full h-12 mt-2 rounded-xl bg-brand hover:scale-[1.02] active:scale-[0.98] text-bg-main font-bold text-[15px] shadow-[0_0_20px_rgba(198,248,36,0.2)] transition-all"
                   >
                     立即注册账号并锁定名额
                   </button>
                 </form>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
