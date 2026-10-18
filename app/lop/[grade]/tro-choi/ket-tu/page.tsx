import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ConnectiveGame from "@/components/games/ConnectiveGame";

export const metadata: Metadata = {
  title: "Trò chơi kết từ lớp 5",
  description: "Học sinh lớp 5 chọn kết từ thích hợp: và, nhưng, hay, vì… nên…, nếu… thì…, tuy… nhưng…",
  alternates: { canonical: "/lop/5/tro-choi/ket-tu" },
};

export default async function Page({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (grade !== "5") notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <ConnectiveGame backHref="/lop/5/tro-choi" />
      </div>
    </div>
  );
}
