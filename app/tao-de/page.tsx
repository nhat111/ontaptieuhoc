import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import Header from "@/components/Header";
import QuickExamClient from "@/components/quickExam/QuickExamClient";
import { GRADES, isGrade, resolveSubject } from "@/lib/subjects";
import { isExamKind, type ExamKind } from "@/lib/quickExam";

const TITLE = "Tạo đề kiểm tra giữa kì, cuối kì nhanh";
const DESCRIPTION =
  "Chọn lớp, chọn đề giữa kì hoặc cuối kì, chọn môn — máy tạo ngay một đề kiểm tra mới kèm đáp án và lời giải. Làm bài trên máy hoặc in ra giấy. Miễn phí.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tao-de" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/tao-de" },
};

interface Props {
  searchParams: Promise<{ lop?: string; loai?: string; mon?: string }>;
}

export default async function QuickExamPage({ searchParams }: Props) {
  // ?lop=&loai=&mon= chỉ để mở sẵn lựa chọn (link từ trang lớp, trang kết quả).
  const sp = await searchParams;
  const grade = isGrade(Number(sp.lop)) ? Number(sp.lop) : GRADES[0];
  const kind: ExamKind = isExamKind(sp.loai) ? sp.loai : "giua-hk1";
  const subject = resolveSubject(grade, sp.mon) ?? "Toán";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <section className="relative overflow-hidden border-b border-primary-100 bg-gradient-to-br from-star-50 via-primary-50 to-sky-50">
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-8 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-soft ring-1 ring-primary-100" aria-hidden>
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight text-slate-900">Tạo đề nhanh</h1>
          <p className="text-sm text-slate-600 sm:text-base">
            Chọn lớp, loại đề và môn — bấm một nút là có đề kiểm tra mới cho bé làm trên máy hoặc in ra giấy.
          </p>
        </div>
      </section>
      <QuickExamClient initialGrade={grade} initialKind={kind} initialSubject={subject} />
    </div>
  );
}
