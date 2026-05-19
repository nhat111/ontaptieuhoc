"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setSessionReady(!!data.session);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("Không thể cập nhật mật khẩu. Link có thể đã hết hạn.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    }
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
        {sessionReady === null && (
          <p className="text-sm text-gray-500 text-center">Đang xác thực...</p>
        )}

        {sessionReady === false && (
          <div className="text-center">
            <p className="text-sm text-red-600 mb-4">Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.</p>
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              Yêu cầu link mới
            </Link>
          </div>
        )}

        {sessionReady === true && !success && (
          <>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Đặt mật khẩu mới</h2>
            <p className="text-sm text-gray-500 mb-6">Nhập mật khẩu mới cho tài khoản của bạn.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? "Đang cập nhật..." : "Đặt mật khẩu mới"}
              </button>
            </form>
          </>
        )}

        {success && (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Mật khẩu đã được cập nhật!</p>
            <p className="text-xs text-gray-500">Đang chuyển đến trang đăng nhập...</p>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-gray-500">
        <Link href="/" className="text-blue-600 hover:underline">← Về trang chủ</Link>
      </p>
    </div>
  );
}
