import Link from "next/link";
import { BookOpenCheck, ChevronRight } from "lucide-react";
import { sgkBook, sgkHref, sgkLessons, sgkReady } from "@/lib/sgk";

/** Thẻ "<Môn> <lớp> theo từng bài sách" trên tab Bài tập của /lop/[grade]: lối vào trang sách + các chủ đề. */
export default function SgkBookBanner({ grade, slug }: { grade: number; slug: string }) {
  const book = sgkBook(grade, slug);
  if (!book) return null;
  const href = sgkHref(grade, slug);
  const label = book.topicLabel ?? "Chủ đề";
  const ready = sgkLessons(grade, slug).filter((x) => sgkReady(grade, x.lesson, slug)).length;
  return (
    <div className="overflow-hidden rounded-2xl border border-success-200 bg-white shadow-soft">
      <Link href={href} className="group flex items-center gap-3 border-b border-success-100 bg-gradient-to-r from-success-50 to-white px-4 py-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-success-500 text-white shadow-sm" aria-hidden>
          <BookOpenCheck className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold text-slate-900">{book.subject} {grade} theo từng bài sách</span>
          <span className="block text-sm text-slate-600">
            {book.book} · {ready} bài luyện trên máy, mỗi lần một bộ câu mới
          </span>
        </span>
        <span className="inline-flex items-center gap-0.5 rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-primary-700 ring-1 ring-success-200">
          Vào học
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </Link>
      <ul className="divide-y divide-slate-100">
        {book.topics.map((t) => (
          <li key={t.so}>
            <Link href={href} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50">
              <span className="flex-shrink-0 min-w-[4.75rem] whitespace-nowrap font-bold text-slate-400">{label} {t.so}</span>
              <span className="min-w-0 flex-1 font-semibold text-slate-800">{t.ten}</span>
              <span className="flex-shrink-0 text-xs font-semibold text-slate-400">{t.bai.length} bài</span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
