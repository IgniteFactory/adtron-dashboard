"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, ChevronDown } from "lucide-react";
import Link from "next/link";
import { UserLead } from "@/lib/mockDb";
import { supabaseDb } from "@/lib/supabaseDb";

type LeadStatus = "pending" | "contacting" | "signed" | "archived";

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: "pending",    label: "待跟进", color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" },
  { value: "contacting", label: "联络中",  color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  { value: "signed",     label: "已签单",  color: "bg-brand/10 text-brand border border-brand/20" },
  { value: "archived",   label: "已归档",  color: "bg-white/5 text-text-secondary border border-white/10" },
];

const FILTER_TABS: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all",        label: "全部" },
  { value: "pending",    label: "待跟进" },
  { value: "contacting", label: "联络中" },
  { value: "signed",     label: "已签单" },
  { value: "archived",   label: "已归档" },
];

const STORAGE_KEY = "redlist_lead_statuses";

function getStoredStatuses(): Record<string, LeadStatus> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

function persistStatus(leadId: string, status: LeadStatus) {
  const all = getStoredStatuses();
  all[leadId] = status;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<UserLead[]>([]);
  const [campaigns, setCampaigns] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<Record<string, LeadStatus>>({});
  const [activeFilter, setActiveFilter] = useState<LeadStatus | "all">("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([supabaseDb.getLeads(), supabaseDb.getCampaigns()]).then(([loadedLeads, loadedCamps]) => {
      setLeads(loadedLeads);
      const campMap: Record<string, string> = {};
      loadedCamps.forEach((c: { id: string; title: string }) => { campMap[c.id] = c.title; });
      setCampaigns(campMap);
    });
    setStatuses(getStoredStatuses());
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

  const changeStatus = (leadId: string, status: LeadStatus) => {
    persistStatus(leadId, status);
    setStatuses(prev => ({ ...prev, [leadId]: status }));
    setOpenDropdown(null);
  };

  const getStatus = (leadId: string): LeadStatus => statuses[leadId] || "pending";

  const filteredLeads = activeFilter === "all"
    ? leads.filter(l => getStatus(l.id) !== "archived")
    : leads.filter(l => getStatus(l.id) === activeFilter);

  const countFor = (f: LeadStatus | "all") =>
    f === "all"
      ? leads.filter(l => getStatus(l.id) !== "archived").length
      : leads.filter(l => getStatus(l.id) === f).length;

  return (
    <div className="space-y-8 pb-20">
      <div>
        <Link href="/admin" className="text-text-secondary hover:text-white text-sm mb-2 block">← 返回总览</Link>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Phone className="w-6 h-6 text-brand" />
          </div>
          商家线索管理
        </h1>
        <p className="text-text-secondary">跟进所有申请加入榜单的商家联系方式与状态。</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeFilter === tab.value
                ? "bg-brand text-bg-main"
                : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.label}
            <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${activeFilter === tab.value ? "bg-black/20" : "bg-white/10"}`}>
              {countFor(tab.value)}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-bg-surface rounded-3xl border border-white/5 overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-sm font-medium text-text-secondary">
              <th className="p-6 font-medium">商家 / 公司名称</th>
              <th className="p-6 font-medium">Person in Charge (负责人)</th>
              <th className="p-6 font-medium">联络电话</th>
              <th className="p-6 font-medium">申请加入的榜单活动</th>
              <th className="p-6 font-medium">跟进状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredLeads.map((lead) => {
              const status = getStatus(lead.id);
              const statusOpt = STATUS_OPTIONS.find(s => s.value === status)!;
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
                    <div className="relative" ref={openDropdown === lead.id ? dropdownRef : null}>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === lead.id ? null : lead.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-opacity hover:opacity-80 ${statusOpt.color}`}
                      >
                        {statusOpt.label}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {openDropdown === lead.id && (
                        <div className="absolute z-30 top-full left-0 mt-1 bg-bg-main border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[120px]">
                          {STATUS_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => changeStatus(lead.id, opt.value)}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors hover:bg-white/5 ${opt.value === status ? "text-brand" : "text-white"}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-text-secondary">
                  {activeFilter === "all"
                    ? "暂无商家意向线索。"
                    : `暂无「${FILTER_TABS.find(t => t.value === activeFilter)?.label}」状态的线索。`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
