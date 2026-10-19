import type { Metadata } from "next";
import Header from "@/components/Header";
import Link from "next/link";
import { FileText, Pencil, Printer } from "lucide-react";
import WorksheetClient from "@/components/worksheet/WorksheetClient";
import DailySheetClient from "@/components/worksheet/DailySheetClient";
import AiSheetClient from "@/components/worksheet/AiSheetClient";

const META = {
  "chu-de": {
    title: "Tạo phiếu bài tập Toán in được",
    description:
      "Tạo phiếu bài tập Toán tiểu học theo chủ đề: chọn lớp, số câu, số đề; tải Word hoặc in PDF kèm đáp án và lời giải. Miễn phí.",
    url: "/phieu-bai-tap",
  },
  "hang-ngay": {
    title: "Phiếu luyện hằng ngày Toán, Tiếng Việt lớp 1, lớp 2",
    description:
      "Phiếu luyện lớp 1, lớp 2 in được: tách gộp số, điền dấu > < =, cộng trừ có nhớ, bảng nhân chia 2 và 5, đổi m dm cm; điền c/k, ch/tr, s/x, r/d/gi, vần ao/au, ai/ay, an/ang vào chỗ chấm. Tải Word hoặc PDF kèm đáp án. Miễn phí.",
    url: "/phieu-bai-tap?loai=hang-ngay",
  },
  ai: {
    title: "Phiếu hoạt động AI lớp 4, lớp 5 – 12 tiết theo Quyết định 2422",
    description:
      "Phiếu hoạt động giáo dục trí tuệ nhân tạo lớp 4, lớp 5 (12 tiết mỗi lớp) theo khung Quyết định 2422/QĐ-BGDĐT: làm trên giấy, không cần máy, kèm trang giáo viên có tiến trình và đáp án. In PDF miễn phí.",
    url: "/phieu-bai-tap?loai=ai",
  },
} as const;

type Tab = keyof typeof META;
const tabOf = (loai?: string): Tab => (loai === "hang-ngay" || loai === "ai" ? loai : "chu-de");

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ loai?: string }> }): Promise<Metadata> {
  const m = META[tabOf((await searchParams).loai)];
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: m.url },
    openGraph: { title: m.title, description: m.description, url: m.url },
  };
}

const TABS = [
  { key: "chu-de", label: "Phiếu theo chủ đề", sub: "Toán lớp 1–5, trắc nghiệm + tự luận" },
  { key: "hang-ngay", label: "Phiếu luyện hằng ngày", sub: "Toán, Tiếng Việt lớp 1, 2" },
  { key: "ai", label: "Hoạt động AI", sub: "Lớp 4, 5 · QĐ 2422" },
] as const;

export default async function WorksheetPage({ searchParams }: { searchParams: Promise<{ loai?: string }> }) {
  const tab = tabOf((await searchParams).loai);
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      {/* Nền pastel kẻ ô như giấy học sinh, thêm bút chì và tờ giấy mờ — không còn khối xanh đậm. */}
      <section className="relative overflow-hidden border-b border-primary-100 bg-gradient-to-br from-sky-50 via-primary-50 to-star-50">
        <div
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(#dbeafe_1px,transparent_1px),linear-gradient(90deg,#dbeafe_1px,transparent_1px)] [background-size:24px_24px]"
          aria-hidden
        />
        <Pencil className="pointer-events-none absolute -left-4 top-6 h-28 w-28 -rotate-12 text-star-300/50 sm:left-8" aria-hidden />
        <FileText className="pointer-events-none absolute -right-6 bottom-2 h-32 w-32 rotate-12 text-primary-200/70 sm:right-10" aria-hidden />
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-soft ring-1 ring-primary-100" aria-hidden>
            <Printer className="h-6 w-6" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight text-slate-900">Phiếu bài tập in được</h1>
          <p className="text-sm text-slate-600 sm:text-base">
            Chọn loại phiếu, bấm tạo phiếu rồi tải Word hoặc in PDF cho bé làm trên giấy.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-1 sm:gap-2 rounded-2xl bg-white/80 p-1.5 shadow-soft ring-1 ring-primary-100 backdrop-blur">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={META[t.key].url}
                aria-current={tab === t.key ? "page" : undefined}
                className={`rounded-xl px-2 sm:px-3 py-2 text-left sm:text-center transition-colors ${
                  tab === t.key ? "bg-primary-600 text-white shadow-sm" : "text-slate-700 hover:bg-primary-50"
                }`}
              >
                <span className="block text-sm font-extrabold">{t.label}</span>
                <span className={`block text-[11px] ${tab === t.key ? "text-primary-100" : "text-slate-500"}`}>{t.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {tab === "hang-ngay" ? <DailySheetClient /> : tab === "ai" ? <AiSheetClient /> : <WorksheetClient />}
    </div>
  );
}
