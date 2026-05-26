import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { getAdminUser, listUsersWithProfiles } from "@/lib/admin";
import AdminUsersClient from "@/components/admin/AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/");

  const users = await listUsersWithProfiles();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <nav className="text-xs mb-3">
          <Link href="/admin" className="text-blue-500 hover:underline">Quản trị</Link>
          <span className="text-gray-400 mx-1">›</span>
          <span className="text-gray-600">Người dùng</span>
        </nav>
        <h1 className="text-xl font-extrabold text-gray-800 mb-4">
          Người dùng &amp; Premium <span className="text-sm font-normal text-gray-400">({users.length})</span>
        </h1>
        <AdminUsersClient users={users} currentAdminId={admin.id} />
      </div>
    </div>
  );
}
