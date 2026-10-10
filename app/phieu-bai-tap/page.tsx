import type { Metadata } from "next";
import Header from "@/components/Header";
import WorksheetClient from "@/components/worksheet/WorksheetClient";

export const metadata: Metadata = {
  title: "Tạo phiếu bài tập Toán in được",
  description:
    "Tạo phiếu bài tập Toán tiểu học theo chủ đề: chọn lớp, số câu, số đề; tải Word hoặc in PDF kèm đáp án và lời giải. Miễn phí.",
  alternates: { canonical: "/phieu-bai-tap" },
  openGraph: {
    title: "Tạo phiếu bài tập Toán in được",
    description: "Phiếu bài tập Toán tiểu học theo chủ đề, tải Word hoặc PDF kèm đáp án.",
    url: "/phieu-bai-tap",
  },
};

export default function WorksheetPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">Phiếu bài tập Toán</h1>
          <p className="text-sm text-blue-100 sm:text-base">
            Chọn lớp và chủ đề, bấm tạo phiếu rồi tải Word hoặc in PDF cho bé làm trên giấy.
          </p>
        </div>
      </section>
      <WorksheetClient />
    </div>
  );
}
