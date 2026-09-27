import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CountingGame from "@/components/games/CountingGame";

export const metadata: Metadata = {
  title: "Trò chơi đếm hình, cộng trừ lớp 1",
  description: "Bé lớp 1 đếm hình, làm quen phép cộng trừ trong phạm vi 10 bằng hình ảnh và giọng đọc.",
  alternates: { canonical: "/lop/1/tro-choi/dem-hinh" },
};

export default async function CountingPage({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "1") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <CountingGame backHref="/lop/1/tro-choi" />
      </div>
    </div>
  );
}
