import type { Metadata } from "next";
import Link from "next/link";
import { Flag, Mail, MessageCircle, Share2 } from "lucide-react";
import Header from "@/components/Header";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { CONTACT, hasContact } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Góp ý & liên hệ",
  description: "Gửi góp ý, báo lỗi hoặc liên hệ với Ôn Tập Phổ Thông. Không cần đăng nhập.",
  alternates: { canonical: "/gop-y" },
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Góp ý & liên hệ</h1>
          <p className="mt-2 text-slate-600">
            Thấy chỗ nào chưa đúng, muốn thêm bài hay có ý tưởng hay? Mọi góp ý đều được đọc kỹ.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <FeedbackForm />

        <p className="flex gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <Flag className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden />
          <span>
            Muốn báo lỗi <b className="text-slate-900">một câu hỏi cụ thể</b>? Làm xong bài, ở trang kết quả mỗi câu có nút{" "}
            <b className="text-slate-900">Báo lỗi câu này</b> — web tự gửi kèm bài và số câu, không cần tả lại.
          </span>
        </p>

        {hasContact && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900">Liên hệ trực tiếp</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              {CONTACT.zalo && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-slate-400" aria-hidden /> Zalo:{" "}
                  <a href={`https://zalo.me/${CONTACT.zalo.replace(/\D/g, "")}`} className="font-semibold text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {CONTACT.zalo}
                  </a>
                </li>
              )}
              {CONTACT.facebook && (
                <li className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-slate-400" aria-hidden /> Facebook:{" "}
                  <a href={CONTACT.facebook} className="font-semibold text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {CONTACT.facebook.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </li>
              )}
              {CONTACT.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" aria-hidden /> Email:{" "}
                  <a href={`mailto:${CONTACT.email}`} className="font-semibold text-blue-600 hover:underline">
                    {CONTACT.email}
                  </a>
                </li>
              )}
            </ul>
          </section>
        )}

        <p className="text-center text-sm text-slate-500">
          Chưa rõ cách dùng? Xem{" "}
          <Link href="/huong-dan" className="font-semibold text-blue-600 hover:underline">
            Hướng dẫn sử dụng
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
