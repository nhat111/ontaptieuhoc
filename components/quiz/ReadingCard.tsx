import { BookOpen } from "lucide-react";
import type { Reading } from "@/lib/quizData";

/**
 * Bài đọc chung của đề Tiếng Việt (phần đọc hiểu), đặt trên các câu hỏi như đề giấy.
 * Gập/mở được: trên điện thoại bài đọc dài, bé gập lại khi đã đọc xong để làm bài.
 */
export default function ReadingCard({ reading, defaultOpen = true }: { reading: Reading; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-6">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-extrabold text-amber-800">
        <BookOpen className="h-4 w-4" aria-hidden />
        Đọc bài sau rồi trả lời câu hỏi
        <span className="ml-auto text-xs font-semibold text-amber-700 group-open:hidden">Mở bài đọc</span>
        <span className="ml-auto hidden text-xs font-semibold text-amber-700 group-open:inline">Thu gọn</span>
      </summary>
      <h2 className="mt-4 text-center text-lg font-extrabold uppercase tracking-wide text-slate-900">{reading.title}</h2>
      <div className="mt-3 space-y-2.5 text-[17px] leading-relaxed text-slate-800">
        {reading.text.split(/\n\s*\n/).map((p, i) => (
          <p key={i} className={p.trim().startsWith("–") ? "pl-4" : "indent-6"}>{p.trim()}</p>
        ))}
      </div>
    </details>
  );
}
