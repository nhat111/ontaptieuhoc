import type { Metadata } from "next";
import ImportClient from "@/components/import/ImportClient";

// Editor surface — nothing to index.
export const metadata: Metadata = {
  title: "Tạo bài tập",
  robots: { index: false, follow: false },
};

export default function ImportPage() {
  return <ImportClient />;
}
