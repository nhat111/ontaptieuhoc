import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import WordGame from "@/components/games/WordGame";

export const metadata: Metadata = {
  title: "Trò chơi nhìn hình chọn chữ — Tiếng Việt lớp 1",
  description: "Bé lớp 1 nhìn hình con vật, đồ vật rồi chọn đúng chữ — luyện đọc từ một tiếng, có giọng đọc.",
  alternates: { canonical: "/lop/1/tro-choi/nhin-hinh" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "1") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <WordGame backHref="/lop/1/tro-choi" />
      </div>
    </div>
  );
}
