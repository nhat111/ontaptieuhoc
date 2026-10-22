import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import type { GuideForm, SampleBlock, WritingGuide } from "@/lib/lamVan";

// Mảnh dùng chung cho /lam-van/lop-5 và /lam-van/lop-5/[dang].

export const TAO_DE_TV5 = `/tao-de?lop=5&mon=${encodeURIComponent("Tiếng Việt")}`;

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Đường dẫn" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-400">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden />}
          {it.href ? <Link href={it.href} className="hover:text-primary-700">{it.label}</Link> : <span className="text-slate-500">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function Card({ id, title, icon, children }: { id?: string; title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
      <h2 className="mb-4 flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-slate-900">
        {icon && (
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600" aria-hidden>
            {icon}
          </span>
        )}
        {title}
      </h2>
      {children}
    </section>
  );
}

export const FORM_LABEL: Record<GuideForm, string> = { "bai-van": "Bài văn", "doan-van": "Đoạn văn", "van-ban": "Văn bản" };

export function FormBadge({ form }: { form: GuideForm }) {
  return (
    <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700 ring-1 ring-violet-200">
      {FORM_LABEL[form]}
    </span>
  );
}

/** "Tập một, Bài 9–16…" — bài tương ứng trong Tiếng Việt 5 Kết nối tri thức. */
export const sgkText = (g: WritingGuide) => `Tập ${g.sgk.tap === 1 ? "một" : "hai"}, ${g.sgk.bai}`;

/**
 * Thân bài tham khảo. Bài văn, đoạn văn: các đoạn thụt đầu dòng. Văn bản (báo cáo,
 * chương trình): dòng căn giữa / căn phải, gạch đầu dòng không thụt, và bảng.
 */
export function SampleBody({ blocks, form }: { blocks: SampleBlock[]; form: GuideForm }) {
  return (
    <div className="space-y-3 border-t border-slate-100 px-4 py-4 text-[15px] leading-relaxed text-slate-800">
      {blocks.map((b, i) => {
        if (typeof b === "string") {
          return <p key={i} className={form === "van-ban" ? (/^[0-9IVX]+\./.test(b) ? "font-bold" : "") : "indent-6"}>{b}</p>;
        }
        if ("center" in b) return <p key={i} className="whitespace-pre-line text-center font-bold">{b.center}</p>;
        if ("right" in b) return <p key={i} className="ml-auto w-fit whitespace-pre-line text-center italic">{b.right}</p>;
        return (
          <div key={i} className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>{b.head.map((h) => <th key={h} className="border border-slate-300 bg-slate-50 px-2 py-1.5 text-left font-bold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {b.rows.map((r, k) => (
                  <tr key={k}>{r.map((c, j) => <td key={j} className="border border-slate-300 px-2 py-1.5 align-top">{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export function Example({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 rounded-xl border-l-4 border-star-300 bg-star-50 px-3 py-2 text-sm italic leading-relaxed text-slate-700">
      {children}
    </p>
  );
}

export function QuickExamCta() {
  return (
    <Link
      href={TAO_DE_TV5}
      className="group flex items-center gap-3 rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 to-white px-4 py-4 shadow-soft transition-all hover:border-primary-300 motion-safe:hover:-translate-y-0.5"
    >
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm" aria-hidden>
        <Sparkles className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-slate-900">Luyện viết với đề thật</span>
        <span className="block text-sm text-slate-600">Tạo đề Tiếng Việt lớp 5 giữa kì, cuối kì — in ra, có phần Kiểm tra viết và gợi ý chấm</span>
      </span>
      <span className="inline-flex items-center gap-0.5 rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-primary-700 ring-1 ring-primary-200">
        Tạo đề
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
