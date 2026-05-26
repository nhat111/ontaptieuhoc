"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminLessonRow } from "@/lib/admin";

export default function AdminContentClient({ lessons }: { lessons: AdminLessonRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [q, setQ] = useState("");

  const filtered = q.trim()
    ? lessons.filter((l) =>
        `${l.title} ${l.subjectName} ${l.chapterTitle} lớp ${l.grade}`.toLowerCase().includes(q.trim().toLowerCase()),
      )
    : lessons;

  async function remove(l: AdminLessonRow) {
    if (!confirm(`Xoá "${l.title}" và toàn bộ câu hỏi? Không thể hoàn tác.`)) return;
    setBusyId(l.id);
    try {
      const res = await fetch("/api/admin/delete-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: l.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { alert(data?.error ?? "Xoá thất bại."); return; }
      router.refresh();
    } catch {
      alert("Không thể kết nối máy chủ.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm theo tên bài, môn, chương, lớp…"
        className="w-full mb-3 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">Không có bài nào khớp.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {filtered.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {l.title}
                  {l.type === "exam" && (
                    <span className="ml-2 text-[10px] font-bold uppercase bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">đề</span>
                  )}
                </p>
                <p className="text-[11px] text-gray-400">
                  {l.subjectName} · Lớp {l.grade} · {l.chapterTitle} · {l.questionCount} câu
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={`/quiz?lessonId=${l.id}`} className="text-xs text-blue-600 hover:underline px-2 py-1">Xem</a>
                <a href={`/import/edit/${l.id}`} className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5">Sửa</a>
                <button
                  onClick={() => remove(l)}
                  disabled={busyId === l.id}
                  className="text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg px-3 py-1.5 disabled:opacity-50"
                >
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
