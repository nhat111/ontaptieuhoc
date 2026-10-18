import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import RoundGame from "@/components/games/RoundGame";

export const metadata: Metadata = {
  title: "Trò chơi làm tròn số lớp 3",
  description: "Luyện làm tròn số đến hàng chục, hàng trăm cho học sinh lớp 3: chữ số từ 5 trở lên thì làm tròn lên.",
  alternates: { canonical: "/lop/3/tro-choi/lam-tron" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "3") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <RoundGame backHref="/lop/3/tro-choi" />
      </div>
    </div>
  );
}
