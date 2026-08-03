"use client";

import {
  LayoutDashboard,
  Megaphone,
  Users,
  BarChart2,
  Settings,
  Zap,
  FileText,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
  { name: "全部活动管理", icon: LayoutDashboard, href: "/admin" },
  { name: "已完成榜单", icon: BarChart2, href: "/admin/completed" },
  { name: "商家意向管理", icon: Megaphone, href: "/admin/leads" },
  { name: "商家用户管理", icon: Users, href: "/admin/users" },
  { name: "落地页内容", icon: FileText, href: "/admin/content" },
  { name: "FAQ 管理", icon: MessageSquare, href: "/admin/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

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
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "group flex items-center px-4 py-3 rounded-xl transition-colors text-sm font-medium",
                active
                  ? "bg-brand text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
              )}
            >
              <Icon
                className={clsx(
                  "w-5 h-5 mr-3",
                  active ? "text-white" : "text-text-secondary group-hover:text-text-primary"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom CTA */}
      <div className="p-6">
        <div className="bg-bg-surface rounded-2xl p-6 text-center shadow-lg relative mt-10">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(232,50,42,0.3)]">
            <Zap className="text-white w-10 h-10 fill-white" />
          </div>
          <div className="mt-8 text-sm text-text-secondary mb-4">
            解锁创作者接单特权
          </div>
          <div>
            <button className="w-full py-2.5 rounded-lg bg-bg-surface-hover hover:bg-bg-sidebar text-text-primary text-sm font-medium transition-colors border border-bg-surface-hover cursor-pointer">
              申请认证博主
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
