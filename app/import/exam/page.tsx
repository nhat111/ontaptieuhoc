import type { Metadata } from "next";
import ImportClient from "@/components/import/ImportClient";
import { currentEditor } from "@/lib/editorAuth";

// Editor surface — nothing to index.
export const metadata: Metadata = {
  title: "Tạo đề kiểm tra",
  robots: { index: false, follow: false },
};

export default async function CreateExamPage() {
  const editor = await currentEditor();
  return <ImportClient examMode editorRole={editor?.role ?? null} />;
}
