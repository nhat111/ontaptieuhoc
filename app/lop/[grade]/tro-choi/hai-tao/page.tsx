import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import AppleGame from "@/components/games/AppleGame";

export const metadata: Metadata = {
  title: "Trò chơi hái táo — cộng trừ lớp 1",
  description: "Bé lớp 1 tính nhẩm cộng trừ trong phạm vi 10 rồi hái quả táo có kết quả đúng.",
  alternates: { canonical: "/lop/1/tro-choi/hai-tao" },
};

export default async function ApplePage({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "1") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <AppleGame backHref="/lop/1/tro-choi" />
      </div>
    </div>
  );
}
