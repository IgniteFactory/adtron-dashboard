"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Save, Image as ImageIcon, FileText, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabaseDb } from "@/lib/supabaseDb";
import { MALAYSIA_LOCATIONS } from "@/lib/mockDb";
import SearchableCombobox from "@/components/SearchableCombobox";
import { titleExamplesDb } from "@/lib/titleExamplesDb";

const CATEGORY_OPTIONS = ["美食探店", "休闲好去处", "时尚潮流", "旅游打卡", "生活服务"];
const AUDIENCE_OPTIONS = [
  "年轻人", "家庭", "美食爱好者", "旅行爱好者", "白领上班族",
  "本地居民", "学生党", "游客/外地人", "时尚美妆爱好者",
  "健康养生者", "数码科技控", "文艺青年"
];

export default function EditCampaign() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState<string[]>([]);
  const [targetSlots, setTargetSlots] = useState(20);
  const [realFilledSlots, setRealFilledSlots] = useState(0);
  const [manualBoost, setManualBoost] = useState(0);
  const [statusText, setStatusText] = useState("");

  // Main image
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [newMainImageFile, setNewMainImageFile] = useState<File | null>(null);
  const [newMainImagePreview, setNewMainImagePreview] = useState<string | null>(null);

  // Posters: track existing (already in Supabase) separately from new uploads
  const [existingPosters, setExistingPosters] = useState<string[]>([]);
  const [newPosterFiles, setNewPosterFiles] = useState<File[]>([]);
  const [newPosterPreviews, setNewPosterPreviews] = useState<string[]>([]);

  // Title examples (localStorage only)
  const [titleExamples, setTitleExamples] = useState<string[]>(["", "", "", "", ""]);

  const totalPosters = existingPosters.length + newPosterFiles.length;

  useEffect(() => {
    supabaseDb.getCampaignById(id).then(camp => {
      if (camp) {
        setTitle(camp.title);
        setCategory(camp.category ? camp.category.split(", ") : []);
        setDescription(camp.description);
        setLocation(camp.location);
        setAudience(camp.audience ? camp.audience.split(", ") : []);
        setTargetSlots(camp.targetSlots);
        setRealFilledSlots(camp.realFilledSlots);
        setManualBoost(camp.manualBoost);
        setMainImageUrl(camp.image);
        setExistingPosters(camp.posters || []);
      }
      // Load title examples: prefer Supabase data, fallback to localStorage
      const dbExamples = (camp?.titleExamples && camp.titleExamples.length > 0)
        ? camp.titleExamples
        : titleExamplesDb.get(id);
      const padded = [...dbExamples, "", "", "", "", ""].slice(0, 5);
      setTitleExamples(padded);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const total = realFilledSlots + manualBoost;
    setStatusText(total >= targetSlots ? "已满人" : "招募中");
  }, [realFilledSlots, manualBoost, targetSlots]);

  const toggleSelection = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  // Main image handlers
  const handleUploadMain = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewMainImageFile(file);
      setNewMainImagePreview(URL.createObjectURL(file));
    }
  };

  const cancelNewMain = () => {
    setNewMainImageFile(null);
    setNewMainImagePreview(null);
  };

  // Poster handlers
  const handleUploadPoster = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (totalPosters >= 3) return;
    const file = e.target.files?.[0];
    if (file) {
      setNewPosterFiles(prev => [...prev, file]);
      setNewPosterPreviews(prev => [...prev, URL.createObjectURL(file)]);
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeExistingPoster = (idx: number) => {
    setExistingPosters(prev => prev.filter((_, i) => i !== idx));
  };

  const removeNewPoster = (idx: number) => {
    setNewPosterFiles(prev => prev.filter((_, i) => i !== idx));
    setNewPosterPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Upload new main image if changed
      let finalMainImage = mainImageUrl;
      if (newMainImageFile) {
        finalMainImage = await supabaseDb.uploadImage(newMainImageFile);
      }

      // Upload new poster files
      const uploadedNewPosters = await Promise.all(
        newPosterFiles.map(file => supabaseDb.uploadImage(file))
      );
      const finalPosters = [...existingPosters, ...uploadedNewPosters];
      const filteredTitleExamples = titleExamples.filter(e => e.trim() !== "");

      // Save to Supabase
      await supabaseDb.updateCampaign(id, {
        title,
        category: category.join(", "),
        description,
        location,
        audience: audience.join(", "),
        targetSlots,
        manualBoost,
        image: finalMainImage ?? undefined,
        posters: finalPosters,
        titleExamples: filteredTitleExamples,
      });

      // Save title examples to localStorage fallback
      titleExamplesDb.set(id, filteredTitleExamples);

      alert("系统提示：榜单活动已更新保存！");
      router.push("/admin");
    } catch (e) {
      console.error(e);
      alert("保存失败，请检查网络！");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="text-white p-10">加载中...</div>;

  // Displayed main image: new preview takes priority over existing
  const displayedMainImage = newMainImagePreview || mainImageUrl;

  return (
    <div className="max-w-4xl pb-20">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold mb-3 border border-brand/20">
          编辑模式
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">管理营销榜单</h1>
        <p className="text-text-secondary">修改活动配置，或是手动调节参与商家数量。</p>
      </div>

      <form className="space-y-8">

        {/* Basic Info Section */}
        <section className="bg-bg-surface p-8 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-white/5 pb-4">基础信息</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">活动标题</label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-bg-main border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-text-secondary">活动类目 (可多选)</label>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  key={opt} type="button"
                  onClick={() => toggleSelection(setCategory, opt)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    category.includes(opt)
                      ? "bg-brand text-bg-main shadow-[0_0_15px_rgba(198,248,36,0.3)]"
                      : "bg-bg-main border border-white/10 text-text-secondary hover:text-white hover:border-white/30"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">活动详情</label>
            <textarea
              rows={4} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full bg-bg-main border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/50 resize-none"
            />
          </div>
        </section>

        {/* Resources & Targets Section */}
        <section className="bg-bg-surface p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white">资源与目标设定</h2>
            <div className="space-y-1 text-right">
              <div className="text-sm font-medium text-text-secondary">当前活动状态</div>
              <div className={`text-lg font-bold ${statusText === "已满人" ? "text-gray-400" : "text-brand"}`}>
                {statusText}
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">目标地点</label>
              <SearchableCombobox
                value={location} onChange={setLocation}
                options={MALAYSIA_LOCATIONS} placeholder="搜索并选择城市..."
                className="w-full md:w-1/2"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-text-secondary">精准目标受众 (可多选)</label>
              <div className="flex flex-wrap gap-2.5">
                {AUDIENCE_OPTIONS.map(opt => (
                  <button
                    key={opt} type="button"
                    onClick={() => toggleSelection(setAudience, opt)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      audience.includes(opt)
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                        : "bg-bg-main border border-white/10 text-text-secondary hover:text-white hover:border-white/30"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-sm font-medium text-text-secondary">需招募总席位</label>
              <input type="number" value={targetSlots} onChange={e => setTargetSlots(parseInt(e.target.value) || 0)} className="w-full md:w-1/3 bg-bg-main border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/50" />
            </div>
          </div>

          <div className="bg-brand/5 border border-brand/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-brand flex items-center gap-2 mb-1">
                ⚡️ 手动增派名额干预 (Slots Override)
              </h3>
              <p className="text-xs text-text-secondary">你可以通过人为增加报名名额来刺激热度，前台将根据"最终显示人数"和"总席位"决定是否收官满员。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <div className="text-xs text-text-secondary mb-1">真实入驻人数 (系统统计)</div>
                <div className="text-2xl font-bold text-white">{realFilledSlots}</div>
                <div className="text-[10px] text-gray-500 mt-1">不可在此手动修改</div>
              </div>

              <div className="bg-black/30 rounded-xl p-4 border border-brand/30">
                <div className="text-xs text-brand mb-1">运营调度增加额</div>
                <div className="flex items-center">
                  <span className="text-brand font-bold text-xl mr-2">+</span>
                  <input
                    type="number"
                    value={manualBoost}
                    onChange={e => setManualBoost(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent border-b border-brand/50 px-1 py-1 text-2xl font-bold text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="bg-brand/10 rounded-xl p-4 border border-brand/30 flex flex-col justify-center">
                <div className="text-xs text-brand/80 mb-1">最终前台展示入驻数</div>
                <div className="text-3xl font-black text-brand flex items-end gap-2">
                  {realFilledSlots + manualBoost}
                  <span className="text-sm font-medium text-text-secondary mb-1.5">/ {targetSlots}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Media Section */}
        <section className="bg-bg-surface p-8 rounded-3xl border border-white/5 space-y-10">

          {/* Main Banner */}
          <div>
            <h2 className="text-xl font-bold text-white mb-2">活动主图 (Main Banner)</h2>
            <p className="text-text-secondary text-sm mb-4">点击图片区域可重新上传替换主图。</p>

            {displayedMainImage ? (
              <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-white/10 group">
                <img src={displayedMainImage} className="w-full h-full object-cover" alt="Main cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md cursor-pointer transition-colors text-sm font-medium">
                    替换主图
                    <input type="file" accept="image/*" onChange={handleUploadMain} className="hidden" />
                  </label>
                  {newMainImagePreview && (
                    <button
                      type="button"
                      onClick={cancelNewMain}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg backdrop-blur-md text-sm font-medium"
                    >
                      撤销替换
                    </button>
                  )}
                </div>
                {newMainImagePreview && (
                  <div className="absolute top-3 left-3 bg-brand text-bg-main text-xs font-bold px-2 py-1 rounded-full">
                    待上传
                  </div>
                )}
              </div>
            ) : (
              <label className="block w-full h-64 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-brand/30 hover:bg-white/5 transition-colors cursor-pointer group">
                <input type="file" accept="image/*" onChange={handleUploadMain} className="hidden" />
                <UploadCloud className="w-8 h-8 text-brand mb-3" />
                <p className="text-white font-medium">点击上传主图</p>
              </label>
            )}
          </div>

          {/* Posters */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white mb-1">预期成效展示海报</h2>
              <p className="text-text-secondary text-sm">最多上传 3 张海报。悬停可删除，删除后可上传新图。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Existing posters */}
              {existingPosters.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 group">
                  <img src={url} className="w-full h-full object-cover" alt={`Poster ${idx + 1}`} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeExistingPoster(idx)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </div>
              ))}

              {/* New poster previews (pending upload) */}
              {newPosterPreviews.map((url, idx) => (
                <div key={`new-${idx}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-brand/30 group">
                  <img src={url} className="w-full h-full object-cover" alt={`New poster ${idx + 1}`} />
                  <div className="absolute top-2 left-2 bg-brand text-bg-main text-xs font-bold px-2 py-1 rounded-full">
                    待上传
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeNewPoster(idx)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      取消
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload slot */}
              {totalPosters < 3 && (
                <label className="block aspect-[3/4] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-brand/30 hover:bg-white/5 transition-colors cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleUploadPoster} className="hidden" />
                  <ImageIcon className="w-8 h-8 text-text-secondary mb-3 opacity-50" />
                  <span className="text-sm font-medium text-text-secondary text-center px-4">
                    上传海报<br />还可传 {3 - totalPosters} 张
                  </span>
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
                  placeholder={`例如：KL必打卡！隐藏版第${i + 1}大宝藏推荐`}
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
            disabled={isSaving}
            className={`px-8 py-3 rounded-xl font-bold text-bg-main flex items-center shadow-[0_0_20px_rgba(198,248,36,0.3)] transition-all ${
              isSaving ? "bg-gray-500 cursor-not-allowed" : "bg-brand hover:scale-105"
            }`}
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? "保存中..." : "保存更改"}
          </button>
        </div>
      </form>
    </div>
  );
}
