import type { Metadata } from "next";
import Link from "next/link";
import { Eye, FolderOpen, Pencil, Plus } from "lucide-react";
import Header from "@/components/Header";
import { DeleteLessonButton } from "@/components/import/DeleteButtons";
import { ACTION_MD, ACTION_PRIMARY, ACTION_SECONDARY, ACTION_SM } from "@/components/import/actionStyles";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isImportProtected } from "@/lib/importAuth";
import { currentEditor, isMissingSchema } from "@/lib/editorAuth";

// Người soạn được mời: các bài của mình (để mở lại sửa). Quản trị: bài do những
// người được mời soạn, kèm tên người soạn — bài của quản trị xem theo chương như cũ.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bài đã soạn",
  robots: { index: false, follow: false },
};

type LessonRow = {
  id: number;
  title: string;
  type: string | null;
  owner_id: string | null;
  chapter_id: number;
  chapters: { title: string; subjects: { grade: number; name: string } | null } | null;
  questions: { count: number }[];
};

export default async function MyLessonsPage() {
  const editor = await currentEditor();
  if (!editor) return null; // layout đã chuyển hướng
  const admin = editor.role === "admin";

  const sb = getSupabaseServer();
  let q = sb
    .from("lessons")
    .select("id, title, type, owner_id, chapter_id, chapters(title, subjects(grade, name)), questions(count)")
    .order("id", { ascending: false })
    .limit(300);
  q = admin ? q.not("owner_id", "is", null) : q.eq("owner_id", editor.userId);
  const [{ data, error }, eds] = await Promise.all([
    q,
    admin ? sb.from("editors").select("email, user_id, note") : Promise.resolve({ data: [] as { email: string; user_id: string | null; note: string | null }[] }),
  ]);
  const lessons = (data ?? []) as unknown as LessonRow[];
  const ownerName = new Map<string, string>();
  for (const e of (eds.data ?? []) as { email: string; user_id: string | null; note: string | null }[]) {
    if (e.user_id) ownerName.set(e.user_id, e.note ? `${e.note} (${e.email})` : e.email);
  }
  const canDelete = isImportProtected();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Link href="/import" className="text-sm text-primary-700 hover:underline">← Khu soạn đề</Link>
            <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold text-slate-900">
              <FolderOpen className="h-6 w-6 text-primary-600" aria-hidden /> {admin ? "Bài do người được mời soạn" : "Bài của tôi"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {admin
                ? "Bài bạn tự soạn xem theo từng chương như trước. Ở đây là bài của những người bạn đã mời."
                : `Đăng nhập bằng ${editor.email}. Bạn sửa, xoá được các bài dưới đây.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/import" className={`${ACTION_MD} ${ACTION_PRIMARY}`}><Plus className="h-4 w-4" aria-hidden /> Soạn bài mới</Link>
            <Link href="/import/exam" className={`${ACTION_MD} ${ACTION_SECONDARY}`}><Plus className="h-4 w-4" aria-hidden /> Soạn đề kiểm tra</Link>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {isMissingSchema(error)
              ? "Chưa bật tính năng nhiều người soạn: cần chạy file supabase/nguoi-soan.sql trong Supabase SQL Editor."
              : `Không tải được danh sách bài: ${error.message}`}
          </p>
        ) : lessons.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            {admin ? "Người được mời chưa soạn bài nào." : "Bạn chưa soạn bài nào. Bấm “Soạn bài mới” để bắt đầu."}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-soft">
            {lessons.map((l) => {
              const subj = l.chapters?.subjects;
              const count = l.questions?.[0]?.count ?? 0;
              const exam = l.type === "exam";
              return (
                <li key={l.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{l.title}</p>
                    <p className="text-xs text-slate-500">
                      {subj ? `Lớp ${subj.grade} · ${subj.name} · ` : ""}
                      {l.chapters?.title ? `${l.chapters.title} · ` : ""}
                      {exam ? "Đề kiểm tra · " : ""}
                      {count} câu
                      {admin && l.owner_id ? ` · ${ownerName.get(l.owner_id) ?? "người đã thôi mời"}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/quiz?lessonId=${l.id}`} className={`${ACTION_SM} ${ACTION_SECONDARY}`}>
                      <Eye className="h-3.5 w-3.5" aria-hidden /> Xem
                    </Link>
                    <Link href={`/import/edit/${l.id}`} className={`${ACTION_SM} ${ACTION_PRIMARY}`}>
                      <Pencil className="h-3.5 w-3.5" aria-hidden /> Sửa
                    </Link>
                    {canDelete && <DeleteLessonButton lessonId={l.id} title={l.title} questionCount={count} isExam={exam} />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
