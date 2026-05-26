"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUserRow } from "@/lib/admin";

export default function AdminUsersClient({
  users,
  currentAdminId,
}: {
  users: AdminUserRow[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function call(path: string, body: object) {
    setBusy(JSON.stringify(body));
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error ?? "Thao tác thất bại.");
        return;
      }
      router.refresh();
    } catch {
      alert("Không thể kết nối máy chủ.");
    } finally {
      setBusy(null);
    }
  }

  function togglePremium(u: AdminUserRow) {
    if (u.isPremium) {
      call("/api/admin/set-premium", { userId: u.id, isPremium: false, premiumUntil: null });
    } else {
      // Default: 1 năm kể từ hôm nay.
      const until = new Date();
      until.setFullYear(until.getFullYear() + 1);
      call("/api/admin/set-premium", { userId: u.id, isPremium: true, premiumUntil: until.toISOString() });
    }
  }

  function grantLifetime(u: AdminUserRow) {
    call("/api/admin/set-premium", { userId: u.id, isPremium: true, premiumUntil: null });
  }

  function deleteUser(u: AdminUserRow) {
    if (!confirm(`Xoá tài khoản ${u.email}? Không thể hoàn tác.`)) return;
    call("/api/admin/delete-user", { userId: u.id });
  }

  if (users.length === 0) {
    return <p className="text-gray-400 text-sm">Chưa có người dùng nào.</p>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
      {users.map((u) => {
        const rowBusy = busy?.includes(u.id);
        return (
          <div key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {u.email}
                {u.isAdmin && (
                  <span className="ml-2 text-[10px] font-bold uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">admin</span>
                )}
              </p>
              <p className="text-[11px] text-gray-400">
                {u.isPremium ? (
                  <span className="text-amber-600 font-medium">
                    Premium{u.premiumUntil ? ` · đến ${new Date(u.premiumUntil).toLocaleDateString("vi-VN")}` : " · vĩnh viễn"}
                  </span>
                ) : (
                  "Miễn phí"
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => togglePremium(u)}
                disabled={rowBusy}
                className={`text-xs font-semibold rounded-lg px-3 py-1.5 border transition-colors disabled:opacity-50 ${
                  u.isPremium
                    ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                    : "border-amber-300 text-amber-700 hover:bg-amber-50"
                }`}
              >
                {u.isPremium ? "Huỷ Premium" : "Cấp Premium (1 năm)"}
              </button>
              {!u.isPremium && (
                <button
                  onClick={() => grantLifetime(u)}
                  disabled={rowBusy}
                  className="text-xs font-semibold rounded-lg px-3 py-1.5 border border-amber-300 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                >
                  Vĩnh viễn
                </button>
              )}
              {u.id !== currentAdminId && (
                <button
                  onClick={() => deleteUser(u)}
                  disabled={rowBusy}
                  className="text-xs font-semibold rounded-lg px-3 py-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  Xoá
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
