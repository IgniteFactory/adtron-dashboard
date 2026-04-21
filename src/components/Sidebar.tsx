"use client";

import { 
  LayoutDashboard, 
  Megaphone, 
  Layers, 
  Users, 
  BarChart2, 
  CreditCard, 
  Settings, 
  Zap,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const NAV_ITEMS = [
  { name: "全部活动管理", icon: LayoutDashboard, href: "/admin", isActive: true },
  { name: "已完成榜单", icon: BarChart2, href: "/admin/completed", hasSub: false },
  { name: "商家客户意向", icon: Users, href: "/admin/users", hasSub: false },
  { name: "活动模板库", icon: Layers, href: "#", hasSub: false },
  { name: "平台财务结算", icon: CreditCard, href: "#", hasSub: false },
  { name: "系统偏好设置", icon: Settings, href: "#", hasSub: false },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-bg-sidebar border-r border-bg-surface-hover flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="h-20 flex items-center px-8 font-bold text-2xl tracking-tight">
        <Zap className="text-brand w-6 h-6 mr-2 fill-brand" />
        adtron
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "group flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-sm font-medium",
                item.isActive 
                  ? "bg-brand text-bg-sidebar" 
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
              )}
            >
              <div className="flex items-center">
                <Icon className={clsx("w-5 h-5 mr-3", item.isActive ? "text-bg-sidebar" : "text-text-secondary group-hover:text-text-primary")} />
                {item.name}
              </div>
              {item.hasSub && (
                <ChevronDown className="w-4 h-4 opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Call to action */}
      <div className="p-6">
        <div className="bg-bg-surface rounded-2xl p-6 text-center shadow-lg relative mt-10">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(198,248,36,0.3)]">
            <Zap className="text-bg-sidebar w-10 h-10 fill-bg-sidebar" />
          </div>
          <div className="mt-8 text-sm text-text-secondary mb-4">
            解锁创作者接单特权
          </div>
          <div>
            <button className="w-full py-2.5 rounded-lg bg-bg-surface-hover hover:bg-bg-sidebar text-text-primary text-sm font-medium transition-colors border border-bg-surface-hover">
              申请认证博主
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
