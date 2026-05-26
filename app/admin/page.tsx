import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { getAdminUser, getAdminStats } from "@/lib/admin";

export const dynamic = "force-dynamic";

const CARDS: { key: keyof Awaited<ReturnType<typeof getAdminStats>>; label: string }[] = [
  { key: "users", label: "Người dùng" },
  { key: "premium", label: "Premium" },
  { key: "lessons", label: "Bài/đề" },
  { key: "exams", label: "Đề kiểm tra" },
  { key: "attempts", label: "Lượt làm bài" },
];

export default async function AdminDashboard() {
  const admin = await getAdminUser();
  if (!admin) redirect("/");

  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-xl font-extrabold text-gray-800 mb-1">Quản trị</h1>
        <p className="text-sm text-gray-500 mb-6">Đăng nhập với quyền admin: {admin.email}</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {CARDS.map((c) => (
            <div key={c.key} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-extrabold text-gray-800">{stats[c.key]}</div>
              <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/admin/users" className="block bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-sm transition-all p-5">
            <h2 className="font-bold text-gray-800 mb-1">Người dùng &amp; Premium</h2>
            <p className="text-sm text-gray-500">Kích hoạt/huỷ Premium, đặt hạn, xoá tài khoản.</p>
          </Link>
          <Link href="/admin/content" className="block bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-sm transition-all p-5">
            <h2 className="font-bold text-gray-800 mb-1">Nội dung</h2>
            <p className="text-sm text-gray-500">Danh sách bài/đề, sửa hoặc xoá.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
