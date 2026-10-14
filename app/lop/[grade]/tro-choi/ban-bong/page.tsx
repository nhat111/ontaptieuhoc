import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import BalloonGame from "@/components/games/BalloonGame";

export const metadata: Metadata = {
  title: "Bắn bóng bay bảng nhân lớp 3",
  description: "Bé lớp 3 chạm bóng bay có kết quả bảng nhân, hoặc phép tính bằng một số cho trước. 45 giây, 3 trái tim, phá kỷ lục.",
  alternates: { canonical: "/lop/3/tro-choi/ban-bong" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "3") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <BalloonGame backHref="/lop/3/tro-choi" />
      </div>
    </div>
  );
}
