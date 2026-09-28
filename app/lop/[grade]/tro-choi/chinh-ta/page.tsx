import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import SpellingGame from "@/components/games/SpellingGame";

export const metadata: Metadata = {
  title: "Trò chơi điền chữ chính tả lớp 2",
  description: "Luyện chính tả lớp 2: ch/tr, s/x, g/gh, ng/ngh, c/k, l/n — nhìn hình điền chữ còn thiếu.",
  alternates: { canonical: "/lop/2/tro-choi/chinh-ta" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "2") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <SpellingGame backHref="/lop/2/tro-choi" />
      </div>
    </div>
  );
}
