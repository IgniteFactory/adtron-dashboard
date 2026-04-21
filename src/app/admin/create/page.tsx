"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, Save, Image as ImageIcon, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseDb } from "@/lib/supabaseDb";
import { Campaign, MALAYSIA_LOCATIONS } from "@/lib/mockDb";
import SearchableCombobox from "@/components/SearchableCombobox";
import { titleExamplesDb } from "@/lib/titleExamplesDb";

const CATEGORY_OPTIONS = ["美食探店", "休闲好去处", "时尚潮流", "旅游打卡", "生活服务"];
const AUDIENCE_OPTIONS = [
  "年轻人", "家庭", "美食爱好者", "旅行爱好者", "白领上班族", 
  "本地居民", "学生党", "游客/外地人", "时尚美妆爱好者", 
  "健康养生者", "数码科技控", "文艺青年"
];

export default function CreateCampaign() {
  const router = useRouter();
  
  // States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(MALAYSIA_LOCATIONS[1]);
  const [audience, setAudience] = useState<string[]>([]);
  const [targetSlots, setTargetSlots] = useState(20);
  const [manualBoost, setManualBoost] = useState(0);

  // Upload states
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  
  const [posterFiles, setPosterFiles] = useState<File[]>([]);
  const [posterUrls, setPosterUrls] = useState<string[]>([]);
  
  const [titleExamples, setTitleExamples] = useState<string[]>(["", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleUploadMain = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       setMainImageFile(file);
       setMainImageUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadPoster = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (posterFiles.length >= 3) return;
    const file = e.target.files?.[0];
    if (file) {
       setPosterFiles(prev => [...prev, file]);
       setPosterUrls(prev => [...prev, URL.createObjectURL(file)]);
    }
  };
  
  const removePoster = (idx: number) => {
    setPosterFiles(prev => prev.filter((_, i) => i !== idx));
    setPosterUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleSelection = (
    setter: React.Dispatch<React.SetStateAction<string[]>>, 
    item: string
  ) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSave = async () => {
    if(!title || !mainImageFile) {
       alert("请至少填写活动标题并上传活动主图。");
       return;
    }
    if (category.length === 0) {
       alert("请至少选择一个活动类目。");
       return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Upload Main Image
      const uploadedMainImgUrl = await supabaseDb.uploadImage(mainImageFile);
      
      // 2. Upload Poster Images
      const uploadedPosters = await Promise.all(
         posterFiles.map(file => supabaseDb.uploadImage(file))
      );

      // 3. Save Campaign to Database
      const newCamp = {
         title,
         category: category.join(", "),
         location,
         audience: audience.join(", "),
         description,
         targetSlots,
         manualBoost,
         realFilledSlots: 0,
         status: "recruiting",
         image: uploadedMainImgUrl,
         posters: uploadedPosters,
      };

      const saved = await supabaseDb.saveCampaign(newCamp as any);

      // Store title examples in localStorage (Supabase table has no column for this)
      if (saved?.id) {
        titleExamplesDb.set(saved.id, titleExamples);
      }

      alert("系统提示：榜单活动已保存并成功发布到云端！");
      router.push("/admin");
    } catch (error) {
      console.error(error);
      alert("发布失败，可能是图片上传或网络问题，请检查！");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">发布新营销榜单</h1>
        <p className="text-text-secondary">配置活动招募的核心资料与博主名额。</p>
      </div>

      <form className="space-y-8">
        
        {/* Basic Info Section */}
        <section className="bg-bg-surface p-8 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-white/5 pb-4">基础信息</h2>
          
          <div className="space-y-2">
             <label className="text-sm font-medium text-text-secondary">活动标题 (Campaign Title)</label>
             <input 
               type="text" 
               value={title}
               onChange={e => setTitle(e.target.value)}
               placeholder="例如：吉隆坡 20 家必吃 Nasi Lemak" 
               className="w-full bg-bg-main border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all"
             />
          </div>
            
          <div className="space-y-3">
             <label className="text-sm font-medium text-text-secondary">活动类目 (Category - 可多选)</label>
             <div className="flex flex-wrap gap-3">
               {CATEGORY_OPTIONS.map(opt => (
                 <button
                   key={opt}
                   type="button"
                   onClick={() => toggleSelection(setCategory, opt)}
                   className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                     category.includes(opt) 
                     ? 'bg-brand text-bg-main shadow-[0_0_15px_rgba(198,248,36,0.3)]' 
                     : 'bg-bg-main border border-white/10 text-text-secondary hover:text-white hover:border-white/30'
                   }`}
                 >
                   {opt}
                 </button>
               ))}
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">活动详情 (Description)</label>
            <textarea 
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="详细描述本次活动的引流目标、博主打法..." 
              className="w-full bg-bg-main border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all resize-none"
            />
          </div>
        </section>

        {/* Resources & Targets Section */}
        <section className="bg-bg-surface p-8 rounded-3xl border border-white/5 space-y-6">
           <h2 className="text-xl font-bold text-white mb-4 border-b border-white/5 pb-4">资源与目标设定</h2>
           
           <div className="space-y-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">目标地点 (Location)</label>
              <SearchableCombobox 
                value={location}
                onChange={setLocation}
                options={MALAYSIA_LOCATIONS}
                placeholder="搜索并选择城市..."
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary">精准目标受众 (Target Audience - 可多选)</label>
              <div className="flex flex-wrap gap-2.5">
               {AUDIENCE_OPTIONS.map(opt => (
                 <button
                   key={opt}
                   type="button"
                   onClick={() => toggleSelection(setAudience, opt)}
                   className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                     audience.includes(opt) 
                     ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                     : 'bg-bg-main border border-white/10 text-text-secondary hover:text-white hover:border-white/30'
                   }`}
                 >
                   {opt}
                 </button>
               ))}
             </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">招募总席位 (Target Slots)</label>
              <input 
                type="number" 
                value={targetSlots}
                onChange={e => setTargetSlots(parseInt(e.target.value) || 0)}
                className="w-full bg-bg-main border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand">手动热度控制 (Initial Filled Slots)</label>
              <input 
                type="number" 
                value={manualBoost}
                onChange={e => setManualBoost(parseInt(e.target.value) || 0)}
                placeholder="手动填入造势热度"
                className="w-full bg-brand/5 border border-brand/20 rounded-xl px-4 py-3 text-brand focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Media Section */}
        <section className="bg-bg-surface p-8 rounded-3xl border border-white/5 space-y-10">
           
           <div>
             <h2 className="text-xl font-bold text-white mb-2">活动主图 (Main Banner)</h2>
             <p className="text-text-secondary text-sm mb-4">这张图将显示在发现大厅卡片与详情页顶部。</p>
             
             {mainImageUrl ? (
               <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-white/10 group">
                 <img src={mainImageUrl} className="w-full h-full object-cover" alt="Main cover" />
                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button type="button" onClick={() => { setMainImageFile(null); setMainImageUrl(null); }} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg backdrop-blur-md">重新上传</button>
                 </div>
               </div>
             ) : (
               <label className="block w-full h-64 border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center hover:border-brand/30 hover:bg-white/5 transition-colors cursor-pointer group">
                  <input type="file" accept="image/*" onChange={handleUploadMain} className="hidden" />
                  <div className="w-16 h-16 rounded-full bg-bg-main flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <UploadCloud className="w-8 h-8 text-brand" />
                  </div>
                  <p className="text-white font-medium text-lg mb-1">浏览并上传本地图片</p>
               </label>
             )}
           </div>

           <div>
             <div className="mb-4">
               <h2 className="text-xl font-bold text-white mb-2">预期成效展示海报 (Expected Outcome Posters)</h2>
               <p className="text-text-secondary text-sm">必须上传 3 张 3:4 的长图海报。</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posterUrls.map((posterUrl, idx) => (
                  <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group">
                    <img src={posterUrl} className="w-full h-full object-cover" alt={`Poster ${idx}`} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removePoster(idx)} className="text-red-400 text-sm">删除海报</button>
                    </div>
                  </div>
                ))}

                {posterUrls.length < 3 && (
                  <label className="block aspect-[3/4] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-brand/30 hover:bg-white/5 transition-colors cursor-pointer">
                     <input type="file" accept="image/*" onChange={handleUploadPoster} className="hidden" />
                     <ImageIcon className="w-8 h-8 text-text-secondary mb-3 opacity-50" />
                     <span className="text-sm font-medium text-text-secondary text-center px-4">本地上传海报</span>
                  </label>
                )}
             </div>
           </div>

        </section>

        {/* Title Examples Section */}
        <section className="bg-bg-surface p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-brand" />
              <h2 className="text-xl font-bold text-white">标题范例 (Title Examples)</h2>
            </div>
            <p className="text-text-secondary text-sm">输入最多 5 个笔记标题范例，帮助商家了解内容方向。留空的栏位将不会显示。</p>
          </div>

          <div className="space-y-3">
            {titleExamples.map((ex, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-xs font-black flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={ex}
                  onChange={e => {
                    const updated = [...titleExamples];
                    updated[i] = e.target.value;
                    setTitleExamples(updated);
                  }}
                  placeholder={`例如：KL必打卡！隐藏版${i + 1}大宝藏推荐`}
                  className="flex-1 bg-bg-main border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-text-secondary/40 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all text-sm"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
           <Link href="/admin" className="px-6 py-3 rounded-xl text-text-secondary hover:text-white font-medium transition-colors">
              取消
           </Link>
           <button
             type="button"
             onClick={handleSave}
             disabled={isSubmitting}
             className={`px-8 py-3 rounded-xl font-bold text-bg-main flex items-center shadow-[0_0_20px_rgba(198,248,36,0.3)] transition-all ${
               isSubmitting ? 'bg-gray-500 cursor-not-allowed hidden-shadow' : 'bg-brand hover:scale-105'
             }`}
           >
              {isSubmitting ? '正在上传图片并发布...' : (
                <>
                  <Save className="w-5 h-5 mr-2" /> 保存并发布
                </>
              )}
           </button>
        </div>

      </form>
    </div>
  );
}
