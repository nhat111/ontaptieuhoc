import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ClockGame from "@/components/games/ClockGame";

export const metadata: Metadata = {
  title: "Trò chơi xem đồng hồ lớp 2",
  description: "Bé lớp 2 luyện xem đồng hồ kim: giờ đúng, giờ rưỡi, 15 phút, 45 phút.",
  alternates: { canonical: "/lop/2/tro-choi/dong-ho" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "2") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <ClockGame backHref="/lop/2/tro-choi" />
      </div>
    </div>
  );
}
