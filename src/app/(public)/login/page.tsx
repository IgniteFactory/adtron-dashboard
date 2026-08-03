"use client";

import { useState } from "react";
import { ArrowLeft, Command } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseDb } from "@/lib/supabaseDb";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabaseDb.loginMerchant(email, password);
      // Wait for a split second so visual feedback passes
      setTimeout(() => {
        router.push("/discover");
      }, 300);
    } catch (err: any) {
      setError(err.message || "登录失败");
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-brand text-bg-main flex items-center justify-center font-bold shadow-[0_0_30px_rgba(198,248,36,0.3)]">
            <Command className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          登录商家验证
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          新商家请前往{" "}
          <Link href="/discover" className="font-medium text-brand hover:text-brand/80 transition-colors">
            发现榜单
          </Link>
          {" "}通过占位注册账号
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-bg-surface py-8 px-4 shadow-xl border border-white/5 sm:rounded-3xl sm:px-10 backdrop-blur-xl">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                登录邮箱 (Email)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-main border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/50 transition-colors"
                placeholder="hello@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                密码 (Password)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-main border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full h-14 mt-2 rounded-xl bg-brand hover:scale-[1.02] active:scale-[0.98] text-bg-main font-bold text-lg shadow-[0_0_20px_rgba(198,248,36,0.3)] transition-all"
            >
              一键验证登录
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <Link 
               href="/" 
               className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> 返回控制前台
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
