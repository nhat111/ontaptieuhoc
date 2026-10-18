import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import UnitGame from "@/components/games/UnitGame";

export const metadata: Metadata = {
  title: "Trò chơi đổi đơn vị đo lớp 4",
  description: "Đổi đơn vị đo khối lượng (yến, tạ, tấn), thời gian (giây, thế kỉ) và diện tích (mm², cm², dm², m²) cho học sinh lớp 4.",
  alternates: { canonical: "/lop/4/tro-choi/doi-don-vi" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "4") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <UnitGame backHref="/lop/4/tro-choi" />
      </div>
    </div>
  );
}
