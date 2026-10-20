"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";
import LostPage, { primaryBtn, secondaryBtn } from "@/components/LostPage";

// Lỗi khi dựng trang (thường là Supabase không trả lời). Thay màn hình lỗi
// tiếng Anh mặc định của Next bằng một trang có nút Thử lại và lối đi tiếp.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <LostPage
      art={<span className="text-6xl" aria-hidden>🛠️</span>}
      title="Trang đang trục trặc một chút"
      message={
        <>
          Bạn thử tải lại sau ít giây nhé. Nếu vẫn lỗi, báo cho chúng mình ở trang{" "}
          <Link href="/gop-y" className="font-semibold text-primary-600 hover:underline">Góp ý</Link>.
          {error.digest && <span className="mt-2 block text-xs text-slate-400">Mã lỗi: {error.digest}</span>}
        </>
      }
      actions={
        <>
          <button onClick={reset} className={primaryBtn}><RefreshCw className="h-5 w-5" aria-hidden />Thử lại</button>
          <Link href="/" className={secondaryBtn}><Home className="h-5 w-5" aria-hidden />Về trang chủ</Link>
        </>
      }
    />
  );
}
