"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/import";

  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const sb = createClient();

    if (tab === "login") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Email hoặc mật khẩu không đúng.");
      } else {
        router.push(redirect);
        router.refresh();
      }
    } else {
      const { error } = await sb.auth.signUp({ email, password });
      if (error) {
        setError(error.message.includes("already")
          ? "Email này đã được đăng ký."
          : "Đăng ký thất bại. Vui lòng thử lại.");
      } else {
        setSuccess("Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.");
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="9" fill="#2563EB"/>
          <path d="M8 25V12C8 11.4 8.4 11 9 11H17V26H9C8.4 26 8 25.6 8 25Z" fill="white" fillOpacity="0.85"/>
          <path d="M28 25V12C28 11.4 27.6 11 27 11H19V26H27C27.6 26 28 25.6 28 25Z" fill="white"/>
          <rect x="17" y="11" width="2" height="15" rx="0.5" fill="#BFDBFE"/>
          <path d="M21 19L23.5 22L27 16" stroke="#F97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="flex flex-col leading-none gap-0.5">
          <span className="text-[17px] font-extrabold text-blue-700 tracking-tight leading-none">Ôn Tập</span>
          <span className="text-[11px] font-bold text-orange-500 tracking-widest leading-none uppercase">Tiểu Học</span>
        </div>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); setSuccess(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === t ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@email.com"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === "register" ? "Tối thiểu 6 ký tự" : "••••••••"}
              minLength={6}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? "Đang xử lý..." : tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        <Link href="/" className="text-blue-600 hover:underline">← Về trang chủ</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
