"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

// Bảng tự kiểm tra sau khi viết xong: bé tích từng mục. Không lưu lại —
// mỗi bài văn là một lần soát mới.

export default function SelfCheck({ items }: { items: string[] }) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  const count = done.filter(Boolean).length;
  const all = count === items.length;

  return (
    <div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <label
              className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border-2 px-3 py-2.5 text-sm transition-colors ${
                done[i] ? "border-success-300 bg-success-50 text-success-800" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={done[i]}
                onChange={() => setDone((d) => d.map((v, k) => (k === i ? !v : v)))}
              />
              <span
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 ${
                  done[i] ? "border-success-500 bg-success-500 text-white" : "border-slate-300 bg-white"
                }`}
                aria-hidden
              >
                {done[i] && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              <span className="leading-relaxed">{it}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className={`text-sm font-bold ${all ? "text-success-700" : "text-slate-500"}`} aria-live="polite">
          {all ? "Tuyệt vời! Bài của em đã sẵn sàng để nộp." : `Đã soát ${count}/${items.length} mục`}
        </p>
        {count > 0 && (
          <button
            type="button"
            onClick={() => setDone(items.map(() => false))}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Soát bài khác
          </button>
        )}
      </div>
    </div>
  );
}
