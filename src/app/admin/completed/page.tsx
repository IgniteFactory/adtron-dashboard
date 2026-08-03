"use client";

import { useState, useEffect } from "react";
import { supabaseDb } from "@/lib/supabaseDb";
import { Campaign } from "@/lib/mockDb";
import { CheckSquare, Calendar, Filter, PieChart as PieChartIcon, Activity, BarChart2 } from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CompletedPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    supabaseDb.getCampaigns().then(allCamps => {
      setCampaigns(allCamps.filter(c => c.status === "completed"));
    });
  }, []);

  // Filter Logic
  const filteredCampaigns = campaigns.filter(camp => {
    if (!camp.completedAt && !camp.createdAt) return true; // Use create date as fallback
    const compDate = new Date(camp.completedAt || camp.createdAt);
    
    if (dateFrom) {
       const fromDate = new Date(dateFrom);
       if (compDate < fromDate) return false;
    }
    if (dateTo) {
       const toDate = new Date(dateTo);
       // Add one day to include the entire 'To' day
       toDate.setDate(toDate.getDate() + 1);
       if (compDate >= toDate) return false;
    }
    return true;
  });

  // Derived Data for Charts
  const categoryData = Object.entries(
    filteredCampaigns.reduce((acc, camp) => {
      acc[camp.category] = (acc[camp.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#C6F824', '#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#a855f7'];

  const timelineData = Object.entries(
    filteredCampaigns.reduce((acc, camp) => {
      const dateStr = new Date(camp.completedAt || camp.createdAt).toLocaleDateString('zh-CN');
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([date, count]) => ({ date, count })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-8 pb-20">
      
      <div className="flex justify-between items-end">
        <div>
          <Link href="/admin" className="text-text-secondary hover:text-white text-sm mb-2 block">← 返回总览</Link>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             <div className="p-2 bg-purple-500/10 rounded-lg">
                <CheckSquare className="w-6 h-6 text-purple-400" />
             </div>
             已发榜 / 归档的榜单活动
          </h1>
          <p className="text-text-secondary">检索所有已经成功凑齐商家的历史营销榜单。</p>
        </div>
      </div>

      {/* Analytics Dashboard section */}
      {filteredCampaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Pie Chart */}
          <div className="bg-bg-surface p-6 rounded-3xl border border-white/5 flex flex-col">
            <h3 className="text-white font-bold flex items-center gap-2 mb-6 text-lg">
              <PieChartIcon className="w-5 h-5 text-brand" /> 结案榜单类型占比
            </h3>
            <div className="flex-1 min-h-[250px] relative">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={categoryData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={90}
                     fill="#8884d8"
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {categoryData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#1C1C1F', borderColor: '#333', borderRadius: '12px' }}
                     itemStyle={{ color: '#fff' }}
                   />
                 </PieChart>
               </ResponsiveContainer>
               {/* Custom Legend */}
               <div className="flex flex-wrap justify-center gap-4 mt-2">
                 {categoryData.map((entry, idx) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs text-text-secondary">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      {entry.name} ({entry.value})
                    </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Timeline Line Chart */}
          <div className="bg-bg-surface p-6 rounded-3xl border border-white/5 flex flex-col">
            <h3 className="text-white font-bold flex items-center gap-2 mb-6 text-lg">
              <Activity className="w-5 h-5 text-brand" /> 结案数量趋势
            </h3>
            <div className="flex-1 min-h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#1C1C1F', borderColor: '#333', borderRadius: '12px' }}
                     itemStyle={{ color: '#C6F824' }}
                   />
                   <Line 
                     type="monotone" 
                     dataKey="count" 
                     name="结案数量"
                     stroke="#C6F824" 
                     strokeWidth={3}
                     dot={{ fill: '#C6F824', strokeWidth: 2, r: 4 }}
                     activeDot={{ r: 6, strokeWidth: 0 }}
                   />
                 </LineChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-bg-surface p-6 rounded-3xl border border-white/5 flex flex-wrap gap-6 items-end">
         <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
               <Calendar className="w-4 h-4" /> 选择起始日期 (Date From)
            </label>
            <input 
               type="date" 
               value={dateFrom}
               onChange={(e) => setDateFrom(e.target.value)}
               className="bg-bg-main border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand styling-date-picker"
            />
         </div>
         <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
               <Calendar className="w-4 h-4" /> 选择截止日期 (Date To)
            </label>
            <input 
               type="date" 
               value={dateTo}
               onChange={(e) => setDateTo(e.target.value)}
               className="bg-bg-main border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-brand"
            />
         </div>
         <button 
           onClick={() => { setDateFrom(""); setDateTo(""); }}
           className="px-4 py-2.5 text-text-secondary hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-colors h-[42px] flex items-center"
         >
           重置过滤
         </button>
      </div>

      <div className="bg-bg-surface rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-sm font-medium text-text-secondary">
              <th className="p-6 font-medium">活动名称</th>
              <th className="p-6 font-medium">类目</th>
              <th className="p-6 font-medium">最终收官进度</th>
              <th className="p-6 font-medium">结案时间</th>
              <th className="p-6 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
             {filteredCampaigns.map((camp) => {
                const totalDisplayedSlots = camp.realFilledSlots + camp.manualBoost;

                return (
                  <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors opacity-80 hover:opacity-100">
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
                        <div className="w-full max-w-[100px] h-2 bg-gray-500/50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gray-400" style={{ width: '100%' }} />
                        </div>
                        <span className="text-sm font-bold text-white">{totalDisplayedSlots}/{camp.targetSlots}</span>
                        {camp.manualBoost > 0 && <span className="text-xs text-text-secondary ml-1">(含人工)</span>}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm font-medium text-white">
                         {new Date(camp.completedAt || camp.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <Link
                        href={`/admin/report/${camp.id}`}
                        title="查看报告"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand bg-brand/10 hover:bg-brand/20 border border-brand/20 transition-colors"
                      >
                        <BarChart2 className="w-3.5 h-3.5" /> 活动报告
                      </Link>
                    </td>
                  </tr>
                );
             })}
            {filteredCampaigns.length === 0 && (
               <tr>
                  <td colSpan={5} className="p-10 text-center text-text-secondary">当前时间范围内没有找到历史结案榜单。</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
