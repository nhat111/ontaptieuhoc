import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpenCheck, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import SgkTopicList, { type SgkTopicView } from "@/components/sgk/SgkTopicList";
import { gradeTheme } from "@/lib/gradeTheme";
import { sgkBook, sgkLessons, sgkProgressKey, sgkReady, sgkToanHref } from "@/lib/sgk";

interface Props {
  params: Promise<{ grade: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const grade = Number((await params).grade);
  const book = sgkBook(grade);
  if (!book) return {};
  const title = `Toán ${grade} ${book.book} – luyện tập theo từng bài`;
  const description = `Bài luyện tập Toán lớp ${grade} theo đúng từng bài sách ${book.book}: làm trên máy, chấm điểm ngay, mỗi lần một bộ câu mới, in được phiếu. Miễn phí, không cần đăng nhập.`;
  return { title, description, alternates: { canonical: sgkToanHref(grade) }, openGraph: { title, description, url: sgkToanHref(grade) } };
}

export default async function SgkToanPage({ params }: Props) {
  const grade = Number((await params).grade);
  const book = sgkBook(grade);
  if (!book) notFound();
  const topics = book.topics;
  const theme = gradeTheme(grade);

  const view = (tap: 1 | 2): SgkTopicView[] => topics.filter((t) => t.tap === tap).map((t) => ({
    so: t.so, ten: t.ten,
    rows: t.bai.map((l) => ({
      so: l.so, ten: l.ten, href: sgkToanHref(grade, l.so), progressKey: sgkProgressKey(grade, l.so),
      status: sgkReady(grade, l) ? "ready" : l.thucHanh ? "paper" : "soon", luyen: !!l.luyen,
    })),
  }));
  const all = sgkLessons(grade);
  const ready = all.filter((x) => sgkReady(grade, x.lesson)).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <nav aria-label="Đường dẫn" className="mb-5 flex items-center gap-1 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-700">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <Link href={`/lop/${grade}`} className="hover:text-slate-700">Lớp {grade}</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="text-slate-600">Toán theo bài</span>
        </nav>

        <div className="mb-6 flex items-start gap-4">
          <span className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-b-4 ${theme.edge} ${theme.soft} ${theme.text} text-4xl font-black tabular-nums`} aria-hidden>
            {grade}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Toán {grade} theo từng bài</h1>
            <p className="mt-1 text-sm text-slate-600">
              Đúng thứ tự bài trong sách <b>{book.book}</b>. Mỗi bài 10 câu, làm trên máy chấm ngay; mỗi lần vào là một bộ câu mới.
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              <BookOpenCheck className="h-3.5 w-3.5 text-success-600" aria-hidden />
              {ready}/{all.length} bài đã luyện được trên máy
            </p>
          </div>
        </div>

        {([1, 2] as const).map((tap) => (
          <section key={tap} className="mb-8">
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-500">Tập {tap === 1 ? "một" : "hai"}</h2>
            <SgkTopicList topics={view(tap)} accent={`${theme.soft} ${theme.text}`} />
          </section>
        ))}
      </div>
    </div>
  );
}
