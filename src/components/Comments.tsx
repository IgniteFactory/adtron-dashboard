"use client";

import { ChevronDown } from "lucide-react";

const COMMENTS = [
  {
    id: 1,
    user: "美妆种草机",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mark",
    action: "申请加入了",
    target: "夏季新品唇釉首发试用",
    time: "2小时前",
    message: "我有30万真实活粉，非常擅长唇妆类内容的拍摄和剪辑，期待合作！",
  },
  {
    id: 2,
    user: "数码评测阿东",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    action: "申请加入了",
    target: "智能投影仪客厅改造计划",
    time: "3小时前",
    message: "刚刚搬入新家，客厅有整面白墙，正准备做投影仪选购指南，匹配度极高。",
  },
  {
    id: 3,
    user: "Vivi 探店日记",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel",
    action: "申请加入了",
    target: "春季限定樱花季探店打卡",
    time: "8小时前",
    message: "坐标上海，每周固定产出高质量探店图文，曾产出多篇10w+爆文小红书。",
  }
];

export default function Comments() {
  return (
    <div className="bg-bg-surface rounded-3xl p-6 lg:p-8 col-span-1 shadow-sm border border-bg-surface-hover/50">
      <h2 className="text-xl font-bold mb-6">社区动态</h2>

      <div className="space-y-6">
        {COMMENTS.map((comment) => (
          <div key={comment.id} className="flex gap-4 group cursor-pointer">
            <img src={comment.avatar} alt={comment.user} className="w-10 h-10 rounded-full bg-gray-700 shrink-0 object-cover" />
            <div className="flex flex-col">
              <p className="text-sm text-text-secondary leading-relaxed">
                <span className="font-semibold text-text-primary mr-1">{comment.user}</span>
                {comment.action}
                <span className="font-semibold text-text-primary ml-1">{comment.target}</span>
              </p>
              <span className="text-xs text-text-secondary/60 mt-0.5">{comment.time}</span>
              
              <p className="text-sm text-text-secondary mt-2 w-full line-clamp-2 pr-4 bg-bg-surface-hover/50 p-2.5 rounded-lg">
                " {comment.message} "
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button className="w-8 h-8 rounded-full bg-bg-surface-hover hover:bg-[#383a42] flex items-center justify-center transition-colors">
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        </button>
      </div>
    </div>
  );
}
