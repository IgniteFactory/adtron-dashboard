"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function CampaignDetail() {
  // Use a generic id from the path or stub
  return (
    <div className="flex flex-col gap-6 h-full max-w-4xl mx-auto pb-10">
      <div className="mt-4">
        <Link href="/" className="inline-flex items-center text-sm text-text-secondary hover:text-brand transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回活动大厅
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary mb-4">
          活动详情
        </h1>
      </div>

      <div className="bg-bg-surface rounded-3xl p-8 border border-bg-surface-hover/50 relative overflow-hidden">
        {/* Mock background pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">小红书招募活动模板</h2>
            <span className="px-4 py-1.5 rounded-full bg-brand/20 text-brand font-medium text-sm">
              火热招募中
            </span>
          </div>

          <p className="text-text-secondary leading-relaxed">
            这是一个模拟的活动详情页入口。当您看到这个页面，说明路由跳转逻辑已经完全跑通！
            我们会在这里展示品牌方需求、合作模式、预期收益以及详细的任务说明。
          </p>

          <div className="bg-bg-surface-hover p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-text-primary flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand" /> 你将获得
            </h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li>1. 产品免费试用及体验包装</li>
              <li>2. 极具竞争力的商业推广佣金</li>
              <li>3. 官方流量扶持与品牌背书</li>
            </ul>
          </div>

          <button className="w-full sm:w-auto mt-8 px-8 py-3 bg-brand text-bg-main font-bold rounded-xl hover:bg-[#D4FF4D] transition-colors shadow-lg shadow-brand/20">
            立即申请加入
          </button>
        </div>
      </div>
    </div>
  );
}
