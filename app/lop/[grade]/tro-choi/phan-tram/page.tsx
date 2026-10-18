import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PercentGame from "@/components/games/PercentGame";

export const metadata: Metadata = {
  title: "Trò chơi tỉ số phần trăm lớp 5",
  description: "Tìm phần trăm của một số và giải bài toán tỉ số phần trăm cho học sinh lớp 5.",
  alternates: { canonical: "/lop/5/tro-choi/phan-tram" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "5") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <PercentGame backHref="/lop/5/tro-choi" />
      </div>
    </div>
  );
}
