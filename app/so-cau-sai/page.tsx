import type { Metadata } from "next";
import Header from "@/components/Header";
import WrongBookHub from "@/components/wrongBook/WrongBookHub";
import { MASTER_AFTER } from "@/lib/wrongBook";

// Sổ chỉ có trên máy của bé — trang trống với máy tìm kiếm, không đưa vào chỉ mục.
export const metadata: Metadata = { title: "Sổ câu sai", robots: { index: false, follow: true } };

export default function WrongBookPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <section className="border-b border-slate-200 bg-gradient-to-br from-coral-50 via-white to-primary-50/60">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Sổ câu sai</h1>
          <p className="mt-2 leading-relaxed text-slate-600">
            Câu nào con làm sai được ghi lại ở đây. Bấm <b>Làm câu tương tự</b> để luyện đúng dạng đó với số khác;
            làm đúng {MASTER_AFTER} lần liền là dạng đó được gạch khỏi sổ.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <WrongBookHub />
      </div>
    </div>
  );
}
