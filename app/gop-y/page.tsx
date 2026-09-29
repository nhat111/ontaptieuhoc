import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { CONTACT, hasContact } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Góp ý & liên hệ",
  description: "Gửi góp ý, báo lỗi hoặc liên hệ với Ôn Tập Tiểu Học. Không cần đăng nhập.",
  alternates: { canonical: "/gop-y" },
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="border-b border-amber-100 bg-[#FFF9EE]">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-10">
          <span className="text-6xl motion-safe:animate-float" aria-hidden>🦉</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Góp ý & liên hệ</h1>
            <p className="mt-1 text-gray-600">
              Thấy chỗ nào chưa đúng, muốn thêm bài hay có ý tưởng hay? Bạn Cú rất muốn nghe!
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <FeedbackForm />

        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          💡 Muốn báo lỗi <b>một câu hỏi cụ thể</b>? Làm xong bài, ở trang kết quả mỗi câu có nút{" "}
          <b>🚩 Báo lỗi câu này</b> — web tự gửi kèm bài và số câu, không cần tả lại.
        </p>

        {hasContact && (
          <section className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-gray-800">Liên hệ trực tiếp</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              {CONTACT.zalo && (
                <li>
                  💬 Zalo:{" "}
                  <a href={`https://zalo.me/${CONTACT.zalo.replace(/\D/g, "")}`} className="font-semibold text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {CONTACT.zalo}
                  </a>
                </li>
              )}
              {CONTACT.facebook && (
                <li>
                  📘 Facebook:{" "}
                  <a href={CONTACT.facebook} className="font-semibold text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    {CONTACT.facebook.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </li>
              )}
              {CONTACT.email && (
                <li>
                  ✉️ Email:{" "}
                  <a href={`mailto:${CONTACT.email}`} className="font-semibold text-blue-600 hover:underline">
                    {CONTACT.email}
                  </a>
                </li>
              )}
            </ul>
          </section>
        )}

        <p className="text-center text-sm text-gray-500">
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
