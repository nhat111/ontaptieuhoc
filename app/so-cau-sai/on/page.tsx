import { Suspense } from "react";
import type { Metadata } from "next";
import WrongPractice from "@/components/wrongBook/WrongPractice";
import { cleanSeed, rowToQuestion } from "@/lib/quickExam";
import { freshSeed } from "@/lib/sgk";
import { SRC_RE, similarRows } from "@/lib/similarRows";

// /so-cau-sai/on?d=<dạng>,<dạng>&goc=1&seed=… — câu tương tự cho các dạng trong Sổ câu sai.

type Props = { searchParams: Promise<{ d?: string; goc?: string; seed?: string }> };

export const metadata: Metadata = { title: "Ôn câu sai", robots: { index: false, follow: false } };

const PER_SINGLE = 5;
const TOTAL = 10;

export default async function WrongPracticePage({ searchParams }: Props) {
  const sp = await searchParams;
  const srcs = (sp.d ?? "").split(",").filter((s) => SRC_RE.test(s)).slice(0, 5);
  const withOriginals = sp.goc === "1";
  const seed = cleanSeed(sp.seed) ?? freshSeed();
  // Một dạng (nút "Làm câu tương tự"): 5 câu; ôn chung: 10 câu chia cho các dạng.
  const rows = similarRows(srcs, srcs.length === 1 && !withOriginals ? PER_SINGLE : TOTAL, seed);

  const base = new URLSearchParams();
  if (srcs.length) base.set("d", srcs.join(","));
  if (withOriginals) base.set("goc", "1");
  const retryHref = `/so-cau-sai/on?${base.toString()}`;
  base.set("seed", seed);

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <WrongPractice
        similar={rows.map((r, i) => rowToQuestion(r, i + 1))}
        withOriginals={withOriginals}
        retryHref={retryHref}
        shareHref={`/so-cau-sai/on?${base.toString()}`}
      />
    </Suspense>
  );
}
