import type { Metadata } from "next";
import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import LostPage, { primaryBtn, secondaryBtn } from "@/components/LostPage";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <LostPage
      art={<span className="text-6xl font-black tracking-tight text-primary-200" aria-hidden>404</span>}
      title="Không tìm thấy trang này"
      message="Có thể đường dẫn bị gõ sai, hoặc bài này đã được chuyển đi chỗ khác."
      actions={
        <>
          <Link href="/" className={primaryBtn}><Home className="h-5 w-5" aria-hidden />Về trang chủ</Link>
          <Link href="/tao-de" className={secondaryBtn}><Sparkles className="h-5 w-5" aria-hidden />Tạo đề nhanh</Link>
        </>
      }
    />
  );
}
