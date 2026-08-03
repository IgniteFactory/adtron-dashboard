"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, LayoutDashboard, PlusCircle, Users, Settings, LogOut, Lock, FileText } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  const navItems = [
    { name: "控制台总览", href: "/admin", icon: LayoutDashboard },
    { name: "发布新榜单", href: "/admin/create", icon: PlusCircle },
    { name: "已完成榜单活动", href: "/admin/completed", icon: LayoutDashboard },
    { name: "商家线索管理", href: "/admin/leads", icon: Users },
    { name: "落地页内容", href: "/admin/content", icon: FileText },
    { name: "系统设置", href: "/admin/settings", icon: Settings },
  ];

  useEffect(() => {
    setIsMounted(true);
    const auth = sessionStorage.getItem("admin_auth_v1");
    if (auth === "HongShuLianMeng") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "HongShuLianMeng") {
      sessionStorage.setItem("admin_auth_v1", passwordInput);
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("系统提示：访问密码错误，请重新输入。");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth_v1");
    setIsAuthenticated(false);
  };

  if (!isMounted) return <div className="min-h-screen bg-bg-main" />; 

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="bg-bg-surface p-8 max-w-sm w-full rounded-3xl border border-white/5 shadow-2xl relative z-10">
          <div className="w-14 h-14 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
             <Lock className="w-6 h-6 text-brand" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 text-center">后台访问权限受限</h2>
          <p className="text-sm text-text-secondary text-center mb-8">
            此区域需要高级权限，请输入后台访问密码。
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="请输入密码解锁" 
                className="w-full bg-bg-main border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand/50 transition-colors"
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
            <button type="submit" className="w-full h-12 bg-white text-bg-main hover:bg-white/90 rounded-xl font-bold text-sm transition-all">
              解锁控制台
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-bg-main min-h-screen text-text-primary">
      
      {/* Sidebar */}
      <aside className="w-64 bg-bg-surface border-r border-white/5 flex flex-col shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand text-bg-main flex items-center justify-center font-bold">
              <Command className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white">红薯<span className="text-brand">后台</span></span>
          </Link>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                  ? "bg-brand/10 text-brand shadow-[inset_2px_0_0_0_#c6f824]" 
                  : "text-text-secondary hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
           <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors font-medium">
            <LogOut className="w-5 h-5" />
            锁住并退出后台
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full p-8 lg:p-12 relative z-0">
        {children}
      </main>

    </div>
  );
}
