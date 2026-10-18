import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import MoneyGame from "@/components/games/MoneyGame";

export const metadata: Metadata = {
  title: "Trò chơi tiền Việt Nam lớp 2",
  description: "Bé lớp 2 đếm tiền với các tờ 100, 200, 500, 1 000 đồng và tính tiền trả lại khi đi chợ.",
  alternates: { canonical: "/lop/2/tro-choi/tien" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "2") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <MoneyGame backHref="/lop/2/tro-choi" />
      </div>
    </div>
  );
}
