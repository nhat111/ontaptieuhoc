import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import ResolveButton from "@/components/feedback/ResolveButton";
import { getSupabaseServer } from "@/lib/supabase/server";
import { reasonLabel } from "@/lib/feedback";

// Hộp thư góp ý cho người quản lý — nằm trong /import nên có khoá mật khẩu
// (app/import/layout.tsx). Đọc bằng service role vì bảng feedback bật RLS.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Góp ý đã nhận",
  robots: { index: false, follow: false },
};

type Row = {
  id: number;
  created_at: string;
  kind: "question" | "general";
  reason: string | null;
  message: string | null;
  contact: string | null;
  lesson_id: number | null;
  question_index: number | null;
  question_text: string | null;
  resolved: boolean;
  lessons: { title: string } | null;
};

async function load(showAll: boolean): Promise<{ rows: Row[]; error?: string }> {
  try {
    let q = getSupabaseServer()
      .from("feedback")
      .select("*, lessons(title)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!showAll) q = q.eq("resolved", false);
    const { data, error } = await q;
    if (error) return { rows: [], error: error.message };
    return { rows: (data ?? []) as Row[] };
  } catch (e) {
    return { rows: [], error: e instanceof Error ? e.message : String(e) };
  }
}

function when(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" });
}

export default async function FeedbackInboxPage({ searchParams }: { searchParams: Promise<{ tat_ca?: string }> }) {
  const { tat_ca } = await searchParams;
  const showAll = tat_ca === "1";
  const { rows, error } = await load(showAll);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-gray-800">📬 Góp ý đã nhận</h1>
        <p className="mt-1 text-sm text-gray-500">Báo lỗi câu hỏi từ trang kết quả và góp ý từ trang Góp ý & liên hệ.</p>

        <div className="mt-4 mb-6 flex gap-2">
          <Link
            href="/import/gop-y"
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${!showAll ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-600"}`}
          >
            Chưa xử lý
          </Link>
          <Link
            href="/import/gop-y?tat_ca=1"
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${showAll ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-600"}`}
          >
            Tất cả
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Không đọc được góp ý: {error}
            {/relation .*feedback.* does not exist|Could not find the table/i.test(error) && (
              <p className="mt-2">
                Bảng <code>feedback</code> chưa có — chạy đoạn SQL “GÓP Ý / BÁO LỖI” ở cuối <code>schema.sql</code> trong Supabase SQL Editor.
              </p>
            )}
          </div>
        )}

        {!error && rows.length === 0 && (
          <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-gray-500">
            <p className="text-4xl">🎉</p>
            <p className="mt-2 font-semibold">{showAll ? "Chưa có góp ý nào." : "Không còn góp ý nào chờ xử lý."}</p>
          </div>
        )}

        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${r.resolved ? "border-gray-100 opacity-60" : "border-gray-200"}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {r.kind === "question" ? (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-bold text-red-700">🚩 {reasonLabel(r.reason) || "Báo lỗi câu"}</span>
                ) : (
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-bold text-blue-700">💬 Góp ý</span>
                )}
                <span className="text-gray-400">{when(r.created_at)}</span>
                {r.resolved && <span className="font-semibold text-green-700">✓ Đã xử lý</span>}
              </div>

              {r.kind === "question" && (
                <p className="mt-2 text-sm text-gray-700">
                  <b>{r.lessons?.title ?? (r.lesson_id ? `Bài #${r.lesson_id}` : "Bài không rõ")}</b>
                  {r.question_index ? ` · Câu ${r.question_index}` : ""}
                  {r.question_text && <span className="mt-1 block rounded-lg bg-gray-50 px-3 py-2 text-gray-600">{r.question_text}</span>}
                </p>
              )}
              {r.message && <p className="mt-2 whitespace-pre-wrap text-[15px] text-gray-800">{r.message}</p>}
              {r.contact && <p className="mt-2 text-sm text-gray-600">📇 Liên hệ: <b>{r.contact}</b></p>}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ResolveButton id={r.id} resolved={r.resolved} />
                {r.lesson_id && (
                  <>
                    <Link href={`/import/edit/${r.lesson_id}`} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50">
                      ✏️ Sửa đề
                    </Link>
                    <Link href={`/quiz?lessonId=${r.lesson_id}`} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                      Mở bài
                    </Link>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
