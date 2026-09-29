"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Đánh dấu góp ý đã xử lý / mở lại. */
export default function ResolveButton({ id, resolved }: { id: number; resolved: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/feedback/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, resolved: !resolved }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? `Lỗi ${res.status}`);
      return;
    }
    router.refresh();
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60 ${
          resolved ? "border border-gray-200 bg-white text-gray-500 hover:border-gray-300" : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {busy ? "…" : resolved ? "Mở lại" : "✓ Đã xử lý"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
