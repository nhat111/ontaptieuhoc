import type { Metadata } from "next";
import { SgkLessonView, sgkLessonMetadata } from "@/components/sgk/SgkPages";

interface Props {
  params: Promise<{ grade: string; bai: string }>;
  searchParams: Promise<{ seed?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { grade, bai } = await params;
  return sgkLessonMetadata(Number(grade), "tieng-viet", bai);
}

export default async function Page({ params, searchParams }: Props) {
  const { grade, bai } = await params;
  return <SgkLessonView grade={Number(grade)} slug="tieng-viet" bai={bai} seed={(await searchParams).seed} />;
}
