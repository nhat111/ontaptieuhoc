import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ClockSetGame from "@/components/games/ClockSetGame";

export const metadata: Metadata = {
  title: "Trò chơi chỉnh đồng hồ lớp 3",
  description: "Bé lớp 3 kéo kim đồng hồ đến đúng giờ: chẵn 5 phút, từng phút, giờ kém, và tính giờ sau một khoảng thời gian.",
  alternates: { canonical: "/lop/3/tro-choi/chinh-dong-ho" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "3") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <ClockSetGame backHref="/lop/3/tro-choi" />
      </div>
    </div>
  );
}
