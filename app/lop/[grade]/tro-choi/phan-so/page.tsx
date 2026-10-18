import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import FractionGame from "@/components/games/FractionGame";

export const metadata: Metadata = {
  title: "Trò chơi phân số lớp 4",
  description: "Học sinh lớp 4 đọc phân số trên hình, so sánh phân số và rút gọn phân số tối giản.",
  alternates: { canonical: "/lop/4/tro-choi/phan-so" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "4") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <FractionGame backHref="/lop/4/tro-choi" />
      </div>
    </div>
  );
}
