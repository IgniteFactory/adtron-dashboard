"use client";

import { Compass, Command, User, LogOut, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabaseDb } from "@/lib/supabaseDb";
import { MerchantUser } from "@/lib/mockDb";

export default function Header() {
  const [currentUser, setCurrentUser] = useState<MerchantUser | null>(null);

  useEffect(() => {
    setCurrentUser(supabaseDb.getCurrentMerchant());
    
    // Simple polling since we rely on localStorage directly without a global context provider
    const interval = setInterval(() => {
      setCurrentUser(supabaseDb.getCurrentMerchant());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    supabaseDb.logoutMerchant();
    setCurrentUser(null);
  };
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-bg-main/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-brand text-bg-main flex items-center justify-center font-bold shadow-[0_0_20px_rgba(198,248,36,0.3)] transition-transform group-hover:scale-105">
              <Command className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
              红薯<span className="text-brand">榜单</span>
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/discover" className="flex items-center gap-2 text-sm font-medium text-white transition-colors">
              <Compass className="w-4 h-4" />
              发现榜单
            </Link>
            <Link href="/faq" className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-white transition-colors">
              <HelpCircle className="w-4 h-4" />
              常见问题
            </Link>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white">
                <User className="w-4 h-4 text-brand" />
                <span className="font-medium">{currentUser.companyName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 p-2.5 rounded-full hover:bg-red-500/10 text-red-400 transition-colors"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link 
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white hover:bg-white/5 transition-colors"
              >
                登录
              </Link>
              <Link 
                href="/discover"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-bg-main text-sm font-bold shadow-[0_0_15px_rgba(198,248,36,0.3)] hover:shadow-[0_0_25px_rgba(198,248,36,0.5)] transition-all hover:scale-105"
              >
                入驻抢位
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
