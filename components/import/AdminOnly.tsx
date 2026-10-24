import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import { currentEditor } from "@/lib/editorAuth";

/**
 * Trang chỉ dành cho quản trị (góp ý, thống kê, người soạn, thu giọng trò chơi,
 * chẩn đoán). Layout /import đã cho người soạn được mời đi qua, nên các trang
 * này tự chặn thêm:
 *
 *   const blocked = await adminOnly();
 *   if (blocked) return blocked;
 */
export async function adminOnly(): Promise<React.ReactElement | null> {
  const editor = await currentEditor();
  if (editor?.role === "admin") return null;
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <ShieldCheck className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="text-xl font-extrabold text-slate-900">Trang này chỉ dành cho người quản trị</h1>
        <p className="mt-2 text-sm text-slate-600">
          Bạn vẫn soạn và sửa bài của mình bình thường.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/import/bai-cua-toi" className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700">
            Bài của tôi
          </Link>
          <Link href="/import" className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-primary-200">
            Soạn bài mới
          </Link>
        </div>
      </div>
    </div>
  );
}
