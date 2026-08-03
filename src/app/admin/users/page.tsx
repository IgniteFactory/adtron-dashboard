"use client";

import { useState, useEffect, useRef } from "react";
import { UserLead } from "@/lib/mockDb";
import { supabaseDb } from "@/lib/supabaseDb";
import { Phone, Users, Tag, X } from "lucide-react";
import Link from "next/link";

const TAG_OPTIONS = ["重点商家", "VIP", "普通商家", "待联系", "合作中", "已付款"];
const TAG_COLORS: Record<string, string> = {
  "重点商家": "bg-red-500/10 text-red-400 border-red-500/20",
  "VIP":      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "普通商家": "bg-white/5 text-text-secondary border-white/10",
  "待联系":   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "合作中":   "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "已付款":   "bg-brand/10 text-brand border-brand/20",
};

const STORAGE_KEY = "redlist_merchant_tags";

function getStoredTags(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

function persistTags(leadId: string, tags: string[]) {
  const all = getStoredTags();
  all[leadId] = tags;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export default function UsersPage() {
  const [leads, setLeads] = useState<UserLead[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<Record<string, string[]>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([supabaseDb.getLeads(), supabaseDb.getCampaigns()]).then(([loadedLeads, loadedCamps]) => {
      setLeads(loadedLeads);
      const campMap: Record<string, string> = {};
      loadedCamps.forEach((c: { id: string; title: string }) => { campMap[c.id] = c.title; });
      setCampaigns(campMap);
    });
    setTags(getStoredTags());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTag = (leadId: string, tag: string) => {
    const current = tags[leadId] || [];
    const updated = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    persistTags(leadId, updated);
    setTags(prev => ({ ...prev, [leadId]: updated }));
  };

  const removeTag = (leadId: string, tag: string) => {
    const updated = (tags[leadId] || []).filter(t => t !== tag);
    persistTags(leadId, updated);
    setTags(prev => ({ ...prev, [leadId]: updated }));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin" className="text-text-secondary hover:text-white text-sm mb-2 block">← 返回总览</Link>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            已入驻商家总库
          </h1>
          <p className="text-text-secondary">查看所有提交申请的商家线报并进行分配。</p>
        </div>
      </div>

      <div className="bg-bg-surface rounded-3xl border border-white/5 overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-sm font-medium text-text-secondary">
              <th className="p-6 font-medium">商家 / 公司名称</th>
              <th className="p-6 font-medium">Person in Charge (负责人)</th>
              <th className="p-6 font-medium">联络电话</th>
              <th className="p-6 font-medium">申请加入的榜单活动</th>
              <th className="p-6 font-medium">标签</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map((lead) => {
              const leadTags = tags[lead.id] || [];
              return (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-white text-lg">{lead.companyName}</div>
                    <div className="text-xs text-text-secondary mt-1">
                      提交于 {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-6 text-white">{lead.picName}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Phone className="w-4 h-4 text-text-secondary" />
                      {lead.phone}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-brand/10 text-brand rounded-lg text-sm truncate max-w-[200px] inline-block">
                      {campaigns[lead.campaignId] || "未知活动"}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      {leadTags.map(tag => (
                        <span
                          key={tag}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${TAG_COLORS[tag] || "bg-white/5 text-white border-white/10"}`}
                        >
                          {tag}
                          <button onClick={() => removeTag(lead.id, tag)} className="cursor-pointer hover:opacity-60 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <div className="relative" ref={openDropdown === lead.id ? dropdownRef : null}>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === lead.id ? null : lead.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                        >
                          <Tag className="w-3 h-3" /> 打标签
                        </button>
                        {openDropdown === lead.id && (
                          <div className="absolute z-30 top-full left-0 mt-1 bg-bg-main border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[130px]">
                            {TAG_OPTIONS.map(tag => (
                              <button
                                key={tag}
                                onClick={() => toggleTag(lead.id, tag)}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors hover:bg-white/5 flex items-center justify-between gap-3 ${
                                  leadTags.includes(tag) ? "text-brand" : "text-white"
                                }`}
                              >
                                {tag}
                                {leadTags.includes(tag) && <span className="text-brand text-xs">✓</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-text-secondary">暂无商家入驻线索。</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
