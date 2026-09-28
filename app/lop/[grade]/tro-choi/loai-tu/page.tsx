import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import WordKindGame from "@/components/games/WordKindGame";

export const metadata: Metadata = {
  title: "Trò chơi từ chỉ sự vật, hoạt động, đặc điểm lớp 2",
  description: "Bé lớp 2 phân loại từ chỉ sự vật, từ chỉ hoạt động và từ chỉ đặc điểm.",
  alternates: { canonical: "/lop/2/tro-choi/loai-tu" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "2") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <WordKindGame backHref="/lop/2/tro-choi" />
      </div>
    </div>
  );
}
