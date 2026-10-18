import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CompareGame from "@/components/games/CompareGame";

export const metadata: Metadata = {
  title: "Trò chơi so sánh số lớp 1",
  description: "Bé lớp 1 so sánh hai số trong phạm vi 10 và 100, chọn dấu lớn hơn, bé hơn, bằng. Có hình để đếm.",
  alternates: { canonical: "/lop/1/tro-choi/so-sanh" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "1") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <CompareGame backHref="/lop/1/tro-choi" />
      </div>
    </div>
  );
}
