import Link from "next/link";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GRADES } from "@/lib/subjects";
import { gradeTheme } from "@/lib/gradeTheme";

/**
 * Khung chung cho trang 404 (app/not-found.tsx) và trang lỗi (app/error.tsx):
 * nói ngắn chuyện gì xảy ra, rồi đưa ngay lối đi tiếp — chọn lớp, tạo đề — để
 * phụ huynh không phải tự gõ lại địa chỉ.
 */
export default function LostPage({
  art,
  title,
  message,
  actions,
}: {
  art: ReactNode;
  title: string;
  message: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
        <div className="rounded-2xl bg-white p-6 text-center shadow-soft sm:p-10">
          <div className="mx-auto flex justify-center">{art}</div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-slate-600">{message}</p>
          <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">{actions}</div>
        </div>

        <section className="mt-8">
          <h2 className="text-center text-sm font-bold text-slate-500">Hoặc chọn lớp để ôn tập</h2>
          <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-9">
            {GRADES.map((g) => {
              const t = gradeTheme(g);
              return (
                <Link
                  key={g}
                  href={`/lop/${g}`}
                  className={`flex aspect-square items-center justify-center rounded-xl border-2 bg-white text-lg font-extrabold ${t.border} ${t.text} ${t.hoverBorder}`}
                  aria-label={`Lớp ${g}`}
                >
                  {g}
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export const primaryBtn =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-b-4 border-primary-800 bg-primary-600 px-6 text-base font-extrabold text-white shadow-pop transition-all hover:bg-primary-700 active:translate-y-0.5 active:border-b-2";
export const secondaryBtn =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 text-base font-bold text-slate-700 hover:border-primary-300";
