import type { Metadata } from "next";
import { SgkBookView, sgkBookMetadata } from "@/components/sgk/SgkPages";

interface Props {
  params: Promise<{ grade: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return sgkBookMetadata(Number((await params).grade), "toan");
}

export default async function Page({ params }: Props) {
  return <SgkBookView grade={Number((await params).grade)} slug="toan" />;
}
