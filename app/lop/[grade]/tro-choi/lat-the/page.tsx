import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import MemoryGame from "@/components/games/MemoryGame";

export const metadata: Metadata = {
  title: "Lật thẻ từ trái nghĩa, cùng nghĩa lớp 3",
  description: "Trò chơi trí nhớ Tiếng Việt lớp 3: lật thẻ ghép cặp từ trái nghĩa (cao – thấp) và từ cùng nghĩa (to – lớn).",
  alternates: { canonical: "/lop/3/tro-choi/lat-the" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "3") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <MemoryGame backHref="/lop/3/tro-choi" />
      </div>
    </div>
  );
}
