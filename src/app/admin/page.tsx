"use client";

import { useState, useEffect } from "react";
import { Users, FileText, Activity, AlertCircle, Edit, Trash2, CheckSquare } from "lucide-react";
import Link from "next/link";
import { supabaseDb } from "@/lib/supabaseDb";
import { Campaign } from "@/lib/mockDb";

export default function AdminDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, runningCampaigns: 0, completedCampaigns: 0, pendingLeads: 0 });

  useEffect(() => {
    supabaseDb.getCampaigns().then(setCampaigns);
    supabaseDb.getStats().then(setStats);
  }, []);

  const handleStatusChange = async (campId: string, newStatus: Campaign['status']) => {
    // Optimistic UI update
    setCampaigns(prev => prev.map(c => 
      c.id === campId ? { ...c, status: newStatus } : c
    ));

    try {
      const updates: Partial<Campaign> = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completedAt = new Date().toISOString();
      }
      await supabaseDb.updateCampaign(campId, updates);
      
      // Refresh stats
      const newStats = await supabaseDb.getStats();
      setStats(newStats);
    } catch (err) {
      console.error("Failed to update status", err);
      alert("状态更新失败，请刷新重试！");
    }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">控制台总览</h1>
        <p className="text-text-secondary">欢迎回来，这里是你掌握所有营销榜单大盘数据的地方。</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-bg-surface p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-brand/10 rounded-xl">
              <Activity className="w-6 h-6 text-brand" />
            </div>
            <span className="text-sm font-medium text-text-secondary">总计</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mb-1">{stats.runningCampaigns}</h3>
            <p className="text-sm text-text-secondary">运行中的榜单活动</p>
          </div>
        </div>

        <Link href="/admin/users" className="bg-bg-surface p-6 rounded-3xl border border-white/5 hover:border-blue-500/50 hover:bg-white/5 transition-all flex flex-col justify-between group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-text-secondary">点击查看明细</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-text-secondary flex items-center justify-between">
              已入驻商家总数 <span className="text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
            </p>
          </div>
        </Link>

        <Link href="/admin/leads" className="bg-bg-surface p-6 rounded-3xl border border-white/5 hover:border-orange-500/50 hover:bg-white/5 transition-all flex flex-col justify-between group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
              <AlertCircle className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-sm font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg animate-pulse">需跟进</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mb-1">{stats.pendingLeads}</h3>
            <p className="text-sm text-text-secondary flex items-center justify-between">
              待处理商家意向名单 <span className="text-orange-400 group-hover:translate-x-1 transition-transform">→</span>
            </p>
          </div>
        </Link>
        
        <Link href="/admin/completed" className="bg-bg-surface p-6 rounded-3xl border border-white/5 hover:border-purple-500/50 hover:bg-white/5 transition-all flex flex-col justify-between group cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
              <CheckSquare className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-text-secondary">归档</span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mb-1">{stats.completedCampaigns}</h3>
            <p className="text-sm text-text-secondary flex items-center justify-between">
              已完成的榜单活动 <span className="text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
            </p>
          </div>
        </Link>
      </div>

      {/* Campaign List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">正在进行的活动</h2>
          <Link href="/admin/create" className="text-sm font-bold text-brand hover:underline">
            + 发布新榜单
          </Link>
        </div>

        <div className="bg-bg-surface rounded-3xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-sm font-medium text-text-secondary">
                <th className="p-6 font-medium">活动名称</th>
                <th className="p-6 font-medium">类目</th>
                <th className="p-6 font-medium">前台进度</th>
                <th className="p-6 font-medium">状态</th>
                <th className="p-6 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {campaigns.filter(c => c.status !== 'completed').map((camp) => {
                const totalDisplayedSlots = camp.realFilledSlots + camp.manualBoost;
                const isFull = totalDisplayedSlots >= camp.targetSlots;
                const progress = Math.min(100, Math.round((totalDisplayedSlots / camp.targetSlots) * 100));

                return (
                  <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="font-bold text-white mb-1">{camp.title}</div>
                      <div className="text-sm text-text-secondary">{camp.location} | {camp.audience}</div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-sm text-text-secondary">
                        {camp.category}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-full max-w-[100px] h-2 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isFull ? 'bg-gray-500' : 'bg-brand'}`} 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                        <span className="text-sm font-bold text-white">{totalDisplayedSlots}/{camp.targetSlots}</span>
                        {camp.manualBoost > 0 && <span className="text-xs text-brand ml-1" title="含人工调度">+{camp.manualBoost}</span>}
                      </div>
                    </td>
                    <td className="p-6">
                      <select
                        value={camp.status}
                        onChange={(e) => handleStatusChange(camp.id, e.target.value as Campaign['status'])}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-md border cursor-pointer outline-none focus:ring-1 focus:ring-brand/50 transition-colors ${
                           camp.status === 'active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                           camp.status === 'full' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                           'bg-brand/10 text-brand border-brand/20'
                        }`}
                      >
                        <option value="recruiting" className="bg-bg-surface text-white">招募中</option>
                        <option value="full" className="bg-bg-surface text-white">已满额</option>
                        <option value="active" className="bg-bg-surface text-white">进行中</option>
                        <option value="completed" className="bg-bg-surface text-white">归档已完成</option>
                      </select>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <Link href={`/admin/edit/${camp.id}`} className="p-2 text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button className="p-2 text-text-secondary hover:text-red-400 bg-white/5 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {campaigns.filter(c => c.status !== 'completed').length === 0 && (
                <tr>
                   <td colSpan={5} className="p-10 text-center text-text-secondary">目前没有任何正在进行的招募活动。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
