"use client";
import { useState } from "react";
import { MAX_MESSAGE, REPORT_REASONS, type ReportReason } from "@/lib/feedback";

interface Props {
  lessonId?: number;
  questionIndex: number; // 1-based
  questionText: string;
}

/**
 * "🚩 Báo lỗi câu này" ở trang kết quả: chọn lý do + ghi chú, gửi kèm bài và
 * số câu để người soạn biết ngay chỗ cần sửa. Gọn trong chính thẻ câu hỏi,
 * không mở trang mới.
 */
export default function ReportButton({ lessonId, questionIndex, questionText }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // ô bẫy bot
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!reason) {
      setError("Bạn chọn một lý do nhé.");
      return;
    }
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "question", reason, message, lessonId, questionIndex, questionText, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Chưa gửi được.");
      setState("sent");
    } catch (e) {
      setState("idle");
      setError(e instanceof Error ? e.message : "Chưa gửi được.");
    }
  }

  if (state === "sent") {
    return <p className="mt-3 text-xs font-semibold text-green-700">✓ Đã gửi báo lỗi. Cảm ơn bạn, người soạn đề sẽ xem và sửa!</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-xs font-semibold text-gray-400 hover:text-red-500"
      >
        🚩 Báo lỗi câu này
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-red-100 bg-red-50/50 p-3">
      <p className="mb-2 text-xs font-bold text-gray-700">Câu này có vấn đề gì?</p>
      <div className="flex flex-wrap gap-1.5">
        {REPORT_REASONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setReason(r.id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              reason === r.id ? "border-red-500 bg-red-500 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-red-300"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={MAX_MESSAGE}
        rows={2}
        placeholder="Ghi thêm nếu muốn, vd: đáp án đúng phải là C"
        className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-red-300 focus:outline-none"
      />
      {/* Ô bẫy bot: ẩn với người thật */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
      />
      {error && <p className="mt-1 text-xs text-red-600">✗ {error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={send}
          disabled={state === "sending"}
          className="rounded-lg bg-red-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-60"
        >
          {state === "sending" ? "Đang gửi…" : "Gửi báo lỗi"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-2 text-xs text-gray-500 hover:text-gray-700">
          Huỷ
        </button>
      </div>
    </div>
  );
}
