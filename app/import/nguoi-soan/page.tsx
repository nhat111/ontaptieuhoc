import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Users } from "lucide-react";
import Header from "@/components/Header";
import { adminOnly } from "@/components/import/AdminOnly";
import { InviteEditorsForm, RemoveEditorButton } from "@/components/import/EditorsManager";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isImportProtected } from "@/lib/importAuth";
import { isMissingSchema } from "@/lib/editorAuth";
import { absoluteUrl } from "@/lib/siteUrl";

// Quản trị mời người cùng soạn đề (bảng `editors`, xem lib/editorAuth.ts).

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Người soạn đề",
  robots: { index: false, follow: false },
};

type Row = { email: string; user_id: string | null; note: string | null; created_at: string };

async function load(): Promise<{ rows: Row[]; counts: Map<string, number>; setupMissing: boolean; error?: string }> {
  const sb = getSupabaseServer();
  const [eds, lessons] = await Promise.all([
    sb.from("editors").select("email, user_id, note, created_at").order("created_at", { ascending: true }),
    sb.from("lessons").select("owner_id").not("owner_id", "is", null),
  ]);
  if (eds.error) {
    return { rows: [], counts: new Map(), setupMissing: isMissingSchema(eds.error), error: eds.error.message };
  }
  const counts = new Map<string, number>();
  for (const l of (lessons.data ?? []) as { owner_id: string }[]) counts.set(l.owner_id, (counts.get(l.owner_id) ?? 0) + 1);
  return { rows: eds.data as Row[], counts, setupMissing: !!lessons.error && isMissingSchema(lessons.error) };
}

export default async function EditorsPage() {
  const blocked = await adminOnly();
  if (blocked) return blocked;

  const { rows, counts, setupMissing, error } = await load();
  const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-soft";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
        <div>
          <Link href="/import" className="text-sm text-primary-700 hover:underline">← Khu soạn đề</Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold text-slate-900">
            <Users className="h-6 w-6 text-primary-600" aria-hidden /> Người soạn đề
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Mời thầy cô, phụ huynh cùng soạn. Mỗi người đăng nhập bằng email của mình, soạn bài mới và chỉ sửa, xoá được bài
            của chính mình. Bạn (người có mật khẩu soạn đề) vẫn sửa được mọi bài.
          </p>
        </div>

        {!isImportProtected() && (
          <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
            Web chưa đặt mật khẩu soạn đề (IMPORT_PASSWORD), nên khu soạn đề đang mở cho tất cả mọi người — mời người soạn
            chưa có tác dụng gì. Đặt mật khẩu trên Vercel rồi deploy lại trước.
          </p>
        )}

        {setupMissing || (error && !rows.length) ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-bold">Cần chạy một lần đoạn SQL tạo bảng người soạn</p>
            <p className="mt-1">
              Mở file <code className="rounded bg-white px-1">supabase/nguoi-soan.sql</code> trong mã nguồn, dán vào Supabase →
              SQL Editor → Run. Chạy lại nhiều lần cũng không sao. Xong thì tải lại trang này.
            </p>
            {error && !setupMissing && <p className="mt-2 text-coral-700">Lỗi: {error}</p>}
          </div>
        ) : (
          <>
            <section className={card}>
              <h2 className="mb-3 text-base font-bold text-slate-800">Mời người soạn</h2>
              <InviteEditorsForm />
            </section>

            <section className={card}>
              <h2 className="text-base font-bold text-slate-800">Gửi cho người được mời</h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                <li>
                  Mở <b>{absoluteUrl("/login")}</b>, chọn <b>Đăng ký</b> bằng <b>đúng email được mời</b>, rồi bấm đường link xác nhận
                  trong hộp thư.
                </li>
                <li>Vào <b>{absoluteUrl("/import")}</b> để soạn. Không cần mật khẩu chung.</li>
              </ol>
            </section>

            <section className={card}>
              <h2 className="mb-3 text-base font-bold text-slate-800">Đã mời ({rows.length})</h2>
              {rows.length === 0 ? (
                <p className="text-sm text-slate-500">Chưa mời ai.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {rows.map((r) => {
                    const n = r.user_id ? counts.get(r.user_id) ?? 0 : 0;
                    return (
                      <li key={r.email} className="flex flex-wrap items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">{r.email}</p>
                          <p className="text-xs text-slate-500">
                            {r.note ? `${r.note} · ` : ""}
                            {r.user_id ? `Đã vào soạn · ${n} bài` : "Chưa vào lần nào"}
                          </p>
                        </div>
                        <RemoveEditorButton email={r.email} lessons={n} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
