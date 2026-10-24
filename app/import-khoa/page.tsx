import type { Metadata } from "next";
import Header from "@/components/Header";
import Link from "next/link";
import { redirect } from "next/navigation";
import ImportLoginForm from "@/components/import/ImportLoginForm";
import { editorStatus } from "@/lib/editorAuth";

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

  const status = await editorStatus();
  // Đã có quyền (vd vừa đăng nhập xong quay lại) thì vào thẳng.
  if (status.editor) redirect(target);

  const loginHref = `/login?redirect=${encodeURIComponent(target)}`;
  const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-soft";
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-md space-y-4 px-4 py-12">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Khu soạn đề</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tạo và sửa đề cần quyền soạn. Phần làm bài của các bé vẫn mở bình thường.
          </p>
        </div>

        <section className={card}>
          <h2 className="text-base font-bold text-slate-800">Thầy cô được mời soạn đề</h2>
          {!status.user ? (
            <>
              <p className="mt-1 text-sm text-slate-600">
                Đăng nhập bằng đúng email đã được mời. Chưa có tài khoản thì chọn <b>Đăng ký</b> với email đó.
              </p>
              <Link
                href={loginHref}
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary-600 text-base font-bold text-white hover:bg-primary-700"
              >
                Đăng nhập bằng email
              </Link>
            </>
          ) : status.setupMissing ? (
            <p className="mt-1 text-sm text-amber-800">
              Web chưa bật tính năng nhiều người soạn. Nhờ người quản trị chạy file <code>supabase/nguoi-soan.sql</code>.
            </p>
          ) : !status.invited ? (
            <p className="mt-1 text-sm text-slate-700">
              Bạn đang đăng nhập bằng <b>{status.user.email}</b> — email này <b>chưa được mời</b> soạn đề. Nhờ người quản trị
              thêm email này ở trang <b>Người soạn đề</b>, hoặc đăng xuất rồi đăng nhập bằng email đã được mời.
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-700">
              Email <b>{status.user.email}</b> đã được mời nhưng <b>chưa xác nhận</b>. Mở hộp thư, bấm đường link xác nhận
              Ôn Tập Phổ Thông đã gửi, rồi tải lại trang này.
            </p>
          )}
        </section>

        <section className={card}>
          <h2 className="text-base font-bold text-slate-800">Người quản trị</h2>
          <p className="mb-3 mt-1 text-sm text-slate-600">Nhập mật khẩu soạn đề chung.</p>
          <ImportLoginForm next={target} />
        </section>
      </div>
    </div>
  );
}
