import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import DecimalGame from "@/components/games/DecimalGame";

export const metadata: Metadata = {
  title: "Trò chơi số thập phân lớp 5",
  description: "Học sinh lớp 5 so sánh số thập phân, tìm hàng của chữ số và viết phân số thập phân thành số thập phân.",
  alternates: { canonical: "/lop/5/tro-choi/thap-phan" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "5") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <DecimalGame backHref="/lop/5/tro-choi" />
      </div>
    </div>
  );
}
