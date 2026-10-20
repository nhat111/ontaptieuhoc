import type { Metadata } from "next";
import Header from "@/components/Header";
import ExamBrowser from "@/components/exams/ExamBrowser";
import { getAllExams } from "@/lib/db";
import { GRADES, getSubjects } from "@/lib/subjects";
import { hasQuickExam } from "@/lib/quickExam";

// Live exam list — read from the DB on each request rather than freezing it
// into a static page at build time (which also needs Supabase env at build).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đề kiểm tra lớp 1-9",
  description:
    "Kho đề kiểm tra tiểu học và THCS lớp 1 đến lớp 9, lọc theo lớp và môn. Làm bài trực tuyến miễn phí, chấm điểm ngay và xem lại đáp án từng câu.",
  alternates: { canonical: "/de-thi" },
  openGraph: {
    title: "Đề kiểm tra lớp 1-9",
    description:
      "Kho đề kiểm tra tiểu học và THCS lớp 1 đến lớp 9, lọc theo lớp và môn. Làm bài trực tuyến miễn phí, chấm điểm ngay.",
    url: "/de-thi",
  },
};

type SP = Promise<{ lop?: string; mon?: string; q?: string }>;

export default async function ExamListPage({ searchParams }: { searchParams: SP }) {
  const [sp, all] = await Promise.all([searchParams, getAllExams()]);
  // Đề chưa có câu nào bấm vào chỉ thấy trang trống — không đưa ra danh sách.
  const exams = all.filter((e) => e.questionCount > 0);

  // Môn nào máy tạo được đề ngay (Tạo đề nhanh) — để ô "chưa có đề" chỉ sang đó.
  const quickSubjects: Record<number, string[]> = {};
  for (const g of GRADES) {
    const list = getSubjects(g).filter((s) => hasQuickExam(g, s));
    if (list.length) quickSubjects[g] = list;
  }

  const lop = Number(sp.lop);
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ExamBrowser
        exams={exams}
        quickSubjects={quickSubjects}
        initial={{
          grade: (GRADES as readonly number[]).includes(lop) ? lop : 0,
          subject: (sp.mon ?? "").slice(0, 60),
          query: (sp.q ?? "").slice(0, 80),
        }}
      />
    </div>
  );
}
