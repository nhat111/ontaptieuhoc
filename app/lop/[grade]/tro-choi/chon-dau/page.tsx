import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ToneGame from "@/components/games/ToneGame";

export const metadata: Metadata = {
  title: "Trò chơi chọn dấu thanh — Tiếng Việt lớp 1",
  description: "Bé lớp 1 nghe đọc rồi chọn chữ mang đúng dấu thanh: sắc, huyền, hỏi, ngã, nặng.",
  alternates: { canonical: "/lop/1/tro-choi/chon-dau" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "1") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <ToneGame backHref="/lop/1/tro-choi" />
      </div>
    </div>
  );
}
