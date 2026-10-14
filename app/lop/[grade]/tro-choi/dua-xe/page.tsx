import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import RaceGame from "@/components/games/RaceGame";

export const metadata: Metadata = {
  title: "Đua xe bảng nhân lớp 3",
  description: "Trò chơi luyện bảng nhân, bảng chia 2–9 cho bé lớp 3: đua xe với Rùa, Thỏ, Tên lửa, giành huy chương cho từng bảng.",
  alternates: { canonical: "/lop/3/tro-choi/dua-xe" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "3") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <RaceGame backHref="/lop/3/tro-choi" />
      </div>
    </div>
  );
}
