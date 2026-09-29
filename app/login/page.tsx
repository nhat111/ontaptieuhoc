"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import { createClient } from "@/lib/supabase/client";
import type { AuthError } from "@supabase/supabase-js";
import { authErrorDetail, authErrorMessage } from "@/lib/authErrors";
import { safeNext } from "@/lib/safeRedirect";

type Tab = "login" | "register" | "forgot";

const INPUT =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[15px] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Mặc định về trang chủ: đa số người đăng nhập là phụ huynh. Trước đây mặc
  // định là /import, nên phụ huynh đăng nhập xong lại rơi vào trang khoá soạn đề.
  const redirect = safeNext(params.get("redirect"));
  const linkExpired = params.get("error") === "link_expired";

  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetail, setErrorDetail] = useState("");
  const [success, setSuccess] = useState("");
  // Hiện nút "Gửi lại email xác nhận" khi đăng nhập bị chặn vì chưa xác nhận.
  const [canResend, setCanResend] = useState(false);

  function switchTab(t: Tab) {
    setTab(t);
    setError("");
    setErrorDetail("");
    setSuccess("");
    setCanResend(false);
    setConfirm("");
  }

  function fail(err: AuthError) {
    console.error("[login]", err.status, err.code, err.message);
    setError(authErrorMessage(err));
    setErrorDetail(authErrorDetail(err));
  }

  /** Link trong email quay về /auth/callback rồi mới tới `next`. */
  function callbackUrl(next: string) {
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setErrorDetail("");
    setSuccess("");
    setCanResend(false);

    const cleanEmail = email.trim();
    if (tab === "register" && password !== confirm) {
      setError("Hai lần nhập mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    const sb = createClient();
    try {
      if (tab === "forgot") {
        const { error } = await sb.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: callbackUrl("/reset-password"),
        });
        // Không nói email có tồn tại hay không (Supabase cũng không báo), để
        // người lạ không dò được ai đã có tài khoản.
        if (error) fail(error);
        else setSuccess("Nếu email này đã đăng ký, bạn sẽ nhận được link đặt lại mật khẩu trong vài phút. Nhớ xem cả mục Spam/Quảng cáo.");
      } else if (tab === "login") {
        const { error } = await sb.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) {
          fail(error);
          setCanResend(error.code === "email_not_confirmed");
        } else {
          router.push(redirect);
          router.refresh();
          return; // giữ trạng thái "đang xử lý" tới khi chuyển trang
        }
      } else {
        const { data, error } = await sb.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: callbackUrl(redirect) },
        });
        if (error) {
          fail(error);
        } else if (data.session) {
          // Dự án tắt "Confirm email": đăng ký xong là đăng nhập luôn.
          router.push(redirect);
          router.refresh();
          return;
        } else if (data.user && data.user.identities?.length === 0) {
          // Email đã có tài khoản: Supabase KHÔNG báo lỗi (để chống dò email) mà
          // trả về user rỗng và không gửi thư. Trước đây trang vẫn báo "kiểm tra
          // email", người dùng đợi mãi không thấy thư.
          setError("Email này đã có tài khoản. Bạn đăng nhập, hoặc bấm “Quên mật khẩu?” nếu không nhớ.");
        } else {
          setSuccess(`Gần xong rồi! Tụi mình đã gửi link xác nhận tới ${cleanEmail}. Mở email, bấm link, rồi quay lại đăng nhập. Không thấy thư thì xem mục Spam/Quảng cáo.`);
          setPassword("");
          setConfirm("");
        }
      }
    } catch (e) {
      console.error("[login]", e);
      setError("Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé.");
      setErrorDetail(e instanceof Error ? e.message : "");
    }
    setLoading(false);
  }

  async function resendConfirm() {
    setLoading(true);
    setError("");
    const { error } = await createClient().auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl(redirect) },
    });
    setLoading(false);
    setCanResend(false);
    if (error) fail(error);
    else setSuccess("Đã gửi lại email xác nhận. Mở hộp thư (cả mục Spam) và bấm link nhé.");
  }

  const title = tab === "forgot" ? "Quên mật khẩu" : tab === "register" ? "Tạo tài khoản" : "Đăng nhập";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2.5">
        <LogoMark />
        <span className="flex flex-col gap-0.5 leading-none">
          <span className="text-[17px] font-extrabold leading-none tracking-tight text-blue-700">Ôn Tập</span>
          <span className="text-[11px] font-bold uppercase leading-none tracking-widest text-orange-500">Tiểu Học</span>
        </span>
      </Link>

      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {tab === "forgot" ? (
          <>
            <h1 className="text-lg font-extrabold text-slate-800">{title}</h1>
            <p className="mb-5 mt-1 text-sm text-slate-500">Nhập email đã đăng ký để nhận link đặt lại mật khẩu.</p>
          </>
        ) : (
          <>
            <h1 className="sr-only">{title}</h1>
            <div className="mb-5 flex rounded-xl bg-slate-100 p-1">
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => switchTab(t)}
                  className={`flex-1 rounded-lg py-2 text-sm font-bold transition-colors ${
                    tab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t === "login" ? "Đăng nhập" : "Đăng ký"}
                </button>
              ))}
            </div>
            {tab === "register" && (
              <p className="mb-4 text-sm leading-relaxed text-slate-500">
                Không bắt buộc — làm bài không cần tài khoản. Đăng ký để lưu <b>tiến độ học tập</b> của bé.
              </p>
            )}
          </>
        )}

        {linkExpired && !error && !success && (
          <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-800">
            Link trong email đã hết hạn, đã dùng rồi, hoặc được mở trên máy/trình duyệt khác với lúc đăng ký. Nếu bạn vừa
            bấm link xác nhận, cứ thử đăng nhập — tài khoản thường đã được xác nhận. Quên mật khẩu thì yêu cầu link mới.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@email.com"
              className={INPUT}
            />
          </div>

          {tab !== "forgot" && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  {showPw ? "Ẩn" : "Hiện"}
                </button>
              </div>
              <input
                id="password"
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                autoComplete={tab === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "register" ? "Tối thiểu 6 ký tự" : "••••••••"}
                className={INPUT}
              />
              {tab === "login" && (
                <button
                  type="button"
                  onClick={() => switchTab("forgot")}
                  className="mt-1.5 block text-xs font-semibold text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              )}
            </div>
          )}

          {tab === "register" && (
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold text-slate-700">Nhập lại mật khẩu</label>
              <input
                id="confirm"
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={INPUT}
              />
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
              {errorDetail && <span className="mt-1 block text-xs text-red-400">Mã lỗi: {errorDetail}</span>}
              {canResend && (
                <button
                  type="button"
                  onClick={resendConfirm}
                  disabled={loading}
                  className="mt-1 block font-bold underline disabled:opacity-60"
                >
                  Gửi lại email xác nhận
                </button>
              )}
            </div>
          )}
          {success && (
            <p role="status" className="rounded-xl bg-green-50 px-3 py-2 text-sm leading-relaxed text-green-800">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading || (tab === "forgot" && !!success)}
            className="mt-1 rounded-xl bg-blue-600 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Đang xử lý…"
              : tab === "login"
                ? "Đăng nhập"
                : tab === "register"
                  ? "Tạo tài khoản"
                  : "Gửi link đặt lại mật khẩu"}
          </button>

          {tab === "forgot" && (
            <button type="button" onClick={() => switchTab("login")} className="text-center text-sm font-semibold text-blue-600 hover:underline">
              ← Quay lại đăng nhập
            </button>
          )}
        </form>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        <Link href="/" className="font-semibold text-blue-600 hover:underline">← Về trang chủ</Link>
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
