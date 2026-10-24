import type { Metadata } from "next";
import ImportClient from "@/components/import/ImportClient";
import { currentEditor } from "@/lib/editorAuth";

// Editor surface — nothing to index.
export const metadata: Metadata = {
  title: "Tạo bài tập",
  robots: { index: false, follow: false },
};

export default async function ImportPage() {
  const editor = await currentEditor();
  return <ImportClient editorRole={editor?.role ?? null} />;
}
