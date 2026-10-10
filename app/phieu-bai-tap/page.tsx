import type { Metadata } from "next";
import Header from "@/components/Header";
import Link from "next/link";
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
    title: "Phiếu luyện hằng ngày Toán, Tiếng Việt lớp 1",
    description:
      "Phiếu luyện lớp 1 in được: tách gộp số, điền dấu > < =, tính, viết số theo thứ tự; điền c/k, ch/tr, s/x, l/n, g/gh, ng/ngh vào chỗ chấm. Tải Word hoặc PDF kèm đáp án. Miễn phí.",
    url: "/phieu-bai-tap?loai=hang-ngay",
  },
  ai: {
    title: "Phiếu hoạt động AI lớp 4 – 12 tiết theo Quyết định 2422",
    description:
      "12 phiếu hoạt động giáo dục trí tuệ nhân tạo lớp 4 theo khung Quyết định 2422/QĐ-BGDĐT: làm trên giấy, không cần máy, kèm trang giáo viên có tiến trình và đáp án. In PDF miễn phí.",
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
  { key: "hang-ngay", label: "Phiếu luyện hằng ngày", sub: "Toán, Tiếng Việt lớp 1" },
  { key: "ai", label: "Hoạt động AI", sub: "12 tiết lớp 4 · QĐ 2422" },
] as const;

export default async function WorksheetPage({ searchParams }: { searchParams: Promise<{ loai?: string }> }) {
  const tab = tabOf((await searchParams).loai);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">Phiếu bài tập in được</h1>
          <p className="text-sm text-blue-100 sm:text-base">
            Chọn loại phiếu, bấm tạo phiếu rồi tải Word hoặc in PDF cho bé làm trên giấy.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-1 sm:gap-2 rounded-2xl bg-white/10 p-1">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={META[t.key].url}
                className={`rounded-xl px-2 sm:px-3 py-2 text-left sm:text-center transition-colors ${
                  tab === t.key ? "bg-white text-blue-700" : "text-white hover:bg-white/10"
                }`}
              >
                <span className="block text-sm font-bold">{t.label}</span>
                <span className={`block text-[11px] ${tab === t.key ? "text-blue-500" : "text-blue-100"}`}>{t.sub}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {tab === "hang-ngay" ? <DailySheetClient /> : tab === "ai" ? <AiSheetClient /> : <WorksheetClient />}
    </div>
  );
}
