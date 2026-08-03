"use client";

import { Eye } from "lucide-react";
import Link from "next/link";

const CREATIVES = [
  {
    id: 1,
    title: "顶级国风美妆试用评测",
    category: "美妆个护",
    time: "即将截止",
    size: "￥5,000",
    type: "图文/视频",
    bg: "bg-gradient-to-br from-pink-500 to-fuchsia-600",
  },
  {
    id: 2,
    title: "AI 办公软件超话推广",
    category: "数码科技",
    time: "招募中",
    size: "￥2,000",
    type: "深度评测",
    bg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
  },
  {
    id: 3,
    title: "新锐咖啡品牌同城探店",
    category: "美食探店",
    time: "刚刚发布",
    size: "免费置换",
    type: "线下打卡",
    bg: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    id: 4,
    title: "智能扫地机器人体验官",
    category: "家居生活",
    time: "3天前",
    size: "￥3,500",
    type: "居家好物",
    bg: "bg-gradient-to-br from-amber-400 to-orange-500",
  },
  {
    id: 5,
    title: "独立设计师女装春季街拍",
    category: "服饰穿搭",
    time: "一周前",
    size: "￥8,000",
    type: "OOTD",
    bg: "bg-gradient-to-br from-red-500 to-rose-600",
  }
];

export default function RecentCreatives() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">精选招募活动</h2>
        <span className="text-sm font-medium text-text-secondary cursor-pointer hover:text-brand transition-colors">查看全部 &rarr;</span>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
        {CREATIVES.map((item) => (
          <Link href={`/campaigns/${item.id}`} key={item.id} className="min-w-[200px] w-[200px] sm:min-w-[240px] sm:w-[240px] shrink-0 snap-start flex flex-col group cursor-pointer">
            {/* Card Graphic */}
            <div className={`relative h-[300px] rounded-3xl p-4 flex flex-col justify-end overflow-hidden ${item.bg}`}>
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium transition-colors flex items-center">
                  查看详情
                </button>
              </div>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              {/* Decorative interior elements */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

              {/* Bottom Tags */}
              <div className="flex items-center gap-2 relative z-10 mt-auto">
                <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-sm">
                  {item.size}
                </span>
                <span className="text-white/90 text-xs font-medium">
                  {item.type}
                </span>
              </div>
            </div>

            {/* Meta Text */}
            <div className="mt-4">
              <h3 className="font-semibold text-text-primary mb-1">{item.title}</h3>
              <p className="text-sm text-text-secondary">
                {item.category} • {item.time}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
