import { redirect } from "next/navigation";
import { currentEditor } from "@/lib/editorAuth";

// Chặn khu soạn nội dung ngay trong layout, KHÔNG dùng `proxy.ts`.
//
// Vì sao không dùng proxy: bản build production không đăng ký được proxy thành
// Edge Function trên Vercel (`middleware-manifest.json` rỗng sau `next build`),
// nên chặn ở đó chạy đúng khi `next start` ở máy nhưng im lặng vô hiệu khi
// deploy — kiểu hỏng tệ nhất, vì trông như đã khoá mà thực ra mở toang.
//
// Layout chạy cùng runtime với các route API, nơi đã xác nhận đọc được biến môi
// trường trên Vercel, và bọc mọi trang trong `/import/*`.
//
// Trang nhập mật khẩu để ở `/import-khoa` — NGOÀI thư mục này — vì nằm bên
// trong thì chính nó cũng bị chặn và sinh vòng lặp chuyển hướng.

export const dynamic = "force-dynamic";

export default async function ImportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Quản trị (mật khẩu chung, hoặc chưa đặt mật khẩu) hoặc người soạn được mời
  // (lib/editorAuth.ts). Trang chỉ dành cho quản trị tự chặn thêm bằng AdminOnly.
  if (!(await currentEditor())) redirect("/import-khoa");
  return <>{children}</>;
}
