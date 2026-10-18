import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import WordClassGame from "@/components/games/WordClassGame";

export const metadata: Metadata = {
  title: "Trò chơi danh từ, động từ, tính từ lớp 4",
  description: "Học sinh lớp 4 phân loại danh từ, động từ, tính từ qua từng từ.",
  alternates: { canonical: "/lop/4/tro-choi/tu-loai" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "4") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <WordClassGame backHref="/lop/4/tro-choi" />
      </div>
    </div>
  );
}
