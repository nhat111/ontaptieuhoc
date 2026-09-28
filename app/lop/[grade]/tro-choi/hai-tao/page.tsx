import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import AppleGame from "@/components/games/AppleGame";

export async function generateMetadata({ params }: { params: Promise<{ grade: string }> }): Promise<Metadata> {
  const { grade } = await params;
  if (grade === "2") {
    return {
      title: "Trò chơi hái táo lớp 2 — cộng trừ có nhớ, nhân chia",
      description: "Bé lớp 2 tính nhẩm cộng trừ có nhớ trong phạm vi 100, bảng nhân chia 2 và 5 rồi hái quả táo đúng.",
      alternates: { canonical: "/lop/2/tro-choi/hai-tao" },
    };
  }
  return {
    title: "Trò chơi hái táo — cộng trừ lớp 1",
    description: "Bé lớp 1 tính nhẩm cộng trừ trong phạm vi 10 rồi hái quả táo có kết quả đúng.",
    alternates: { canonical: "/lop/1/tro-choi/hai-tao" },
  };
}

export default async function ApplePage({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "1" && grade !== "2") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <AppleGame backHref={`/lop/${grade}/tro-choi`} grade={grade === "2" ? 2 : 1} />
      </div>
    </div>
  );
}
