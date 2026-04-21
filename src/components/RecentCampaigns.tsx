"use client";

import Link from "next/link";

const CAMPAIGNS = [
  {
    id: 1,
    creator: { name: "完美日记 PerfectDiary", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brand1" },
    campaign: { name: "夏季新品唇釉首发试用", count: "招募 50 位博主", icon: "💄", color: "bg-pink-500" },
    lastEdit: "3 天前发布",
    editedBy: [
      "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=3"
    ]
  },
  {
    id: 2,
    creator: { name: "星巴克中国", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brand2" },
    campaign: { name: "春季限定樱花季探店打卡", count: "招募 100 位博主", icon: "☕", color: "bg-green-600" },
    lastEdit: "2 天前发布",
    editedBy: [
      "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=6"
    ]
  },
  {
    id: 3,
    creator: { name: "极米科技 XGIMI", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brand3" },
    campaign: { name: "智能投影仪客厅改造计划", count: "招募 15 位博主", icon: "📽️", color: "bg-slate-700 text-white" },
    lastEdit: "昨天发布",
    editedBy: [
      "https://api.dicebear.com/7.x/avataaars/svg?seed=7",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=8",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=9"
    ]
  },
  {
    id: 4,
    creator: { name: "lululemon", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brand4" },
    campaign: { name: "瑜伽女孩 OOTD 穿搭分享", count: "招募 30 位博主", icon: "🧘‍♀️", color: "bg-red-500 text-white" },
    lastEdit: "4 天前发布",
    editedBy: [
      "https://api.dicebear.com/7.x/avataaars/svg?seed=10",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=11",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=12"
    ]
  }
];

export default function RecentCampaigns() {
  return (
    <div className="bg-bg-surface rounded-3xl p-6 lg:p-8 col-span-1 xl:col-span-2 shadow-sm border border-bg-surface-hover/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">全部营销活动</h2>
      </div>

      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-12 text-xs font-semibold tracking-wider text-text-secondary uppercase pb-4 border-b border-bg-surface-hover">
          <div className="col-span-4">品牌方</div>
          <div className="col-span-4">活动名称</div>
          <div className="col-span-2 text-center lg:text-left">发布时间</div>
          <div className="col-span-2 text-right lg:text-left">已申请博主</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {CAMPAIGNS.map((row) => (
            <Link href={`/campaigns/${row.id}`} key={row.id} className="grid grid-cols-12 items-center py-4 border-b border-bg-surface-hover last:border-0 hover:bg-bg-surface-hover/30 transition-colors rounded-xl -mx-4 px-4 cursor-pointer">
              
              {/* Creator */}
              <div className="col-span-4 flex items-center gap-3">
                <img src={row.creator.avatar} alt="Avatar" className="w-10 h-10 rounded-full bg-gray-700" />
                <span className="font-semibold text-text-primary truncate">{row.creator.name}</span>
              </div>

              {/* Campaign */}
              <div className="col-span-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm ${row.campaign.color}`}>
                  {row.campaign.icon}
                </div>
                <div className="flex flex-col truncate pr-2">
                  <span className="font-semibold text-text-primary truncate transition-colors hover:text-brand">{row.campaign.name}</span>
                  <span className="text-xs text-text-secondary">{row.campaign.count}</span>
                </div>
              </div>

              {/* Last Edit */}
              <div className="col-span-2 text-sm text-text-secondary text-center lg:text-left">
                {row.lastEdit}
              </div>

              {/* Edit By */}
              <div className="col-span-2 flex items-center justify-end lg:justify-start">
                <div className="flex -space-x-2">
                  {row.editedBy.map((avatar, i) => (
                    <img key={i} src={avatar} className="w-8 h-8 rounded-full border-2 border-bg-surface bg-gray-700" alt="Editor" />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-bg-surface bg-bg-surface-hover flex items-center justify-center text-[10px] text-text-secondary font-medium">
                    +更多
                  </div>
                </div>
              </div>

            </Link>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <button className="px-6 py-2 rounded-full bg-bg-surface-hover hover:bg-[#383a42] text-sm text-text-primary transition-colors font-medium">
            加载更多活动
          </button>
        </div>
      </div>
    </div>
  );
}
