"use client";
import { useState } from "react";

export default function ImportLoginForm({ next }: { next: string }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/import-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? `Lỗi ${res.status}`);
      // Dùng thay cho router.push để trang được dựng lại kèm cookie mới.
      window.location.href = next;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không đăng nhập được.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        placeholder="Mật khẩu"
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {err && <p className="text-xs text-red-600">{err}</p>}
      <button
        type="submit"
        disabled={busy || !password}
        className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {busy ? "Đang mở khoá…" : "Truy cập"}
      </button>
    </form>
  );
}
