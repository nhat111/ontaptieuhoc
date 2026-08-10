import type { Metadata } from "next";
import Header from "@/components/Header";
import ImportLoginForm from "@/components/import/ImportLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nhập mật khẩu",
  robots: { index: false, follow: false },
};

export default async function ImportLockPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Chỉ nhận đường dẫn nội bộ — nhận URL tuyệt đối là mở đường chuyển hướng
  // sang site khác sau khi đăng nhập.
  const target = typeof next === "string" && /^\/import(\/|$)/.test(next) ? next : "/import";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mb-1 text-xl font-extrabold text-gray-800">Khu soạn nội dung</h1>
        <p className="mb-6 text-sm text-gray-500">
          Phần tạo và sửa đề cần mật khẩu. Phần làm bài của các bé vẫn mở bình thường.
        </p>
        <ImportLoginForm next={target} />
      </div>
    </div>
  );
}
