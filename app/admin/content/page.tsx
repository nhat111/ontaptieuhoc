import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { getAdminUser, listAllLessons } from "@/lib/admin";
import AdminContentClient from "@/components/admin/AdminContentClient";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/");

  const lessons = await listAllLessons();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <nav className="text-xs mb-3">
          <Link href="/admin" className="text-blue-500 hover:underline">Quản trị</Link>
          <span className="text-gray-400 mx-1">›</span>
          <span className="text-gray-600">Nội dung</span>
        </nav>
        <h1 className="text-xl font-extrabold text-gray-800 mb-4">
          Nội dung <span className="text-sm font-normal text-gray-400">({lessons.length} bài/đề)</span>
        </h1>
        <AdminContentClient lessons={lessons} />
      </div>
    </div>
  );
}
