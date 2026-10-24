import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { adminOnly } from "@/components/import/AdminOnly";
import { getSupabaseServer } from "@/lib/supabase/server";
import { GRADES, getSubjects } from "@/lib/subjects";

// Trang chẩn đoán mở được bằng điện thoại — thay cho
// `node scripts/check-subjects.mjs` khi không ngồi máy tính.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kiểm tra cấu hình",
  robots: { index: false, follow: false },
};

type Row = { grade: number; name: string; chapters: number; lessons: number; filled: number; questions: number };

type RawSubject = {
  grade: number;
  name: string;
  chapters: { lessons: { questions: { count: number }[] }[] }[] | null;
};

/**
 * Môn trong DB kèm số chương / bài / câu — để biết môn bị ẩn là nội dung thật
 * đang mất khỏi web (cần thêm vào lib/subjects.ts) hay chỉ là dòng trống còn
 * sót từ dữ liệu mẫu (xoá được). Một truy vấn lồng, không gọi từng môn.
 */
async function readSubjects(): Promise<{ rows: Row[] | null; error?: string }> {
  try {
    const { data, error } = await getSupabaseServer()
      .from("subjects")
      .select("grade, name, chapters(lessons(questions(count)))")
      .order("grade");
    if (error) return { rows: null, error: `${error.code ?? ""} ${error.message}`.trim() };
    const rows = ((data ?? []) as unknown as RawSubject[]).map((s) => {
      const lessons = (s.chapters ?? []).flatMap((c) => c.lessons ?? []);
      const counts = lessons.map((l) => l.questions?.[0]?.count ?? 0);
      return {
        grade: s.grade,
        name: s.name,
        chapters: (s.chapters ?? []).length,
        lessons: lessons.length,
        filled: counts.filter((n) => n > 0).length,
        questions: counts.reduce((a, b) => a + b, 0),
      };
    });
    return { rows };
  } catch (e) {
    return { rows: null, error: e instanceof Error ? e.message : String(e) };
  }
}

async function countTable(table: "chapters" | "lessons" | "questions") {
  try {
    const { count, error } = await getSupabaseServer()
      .from(table)
      .select("id", { count: "exact", head: true });
    if (error) return { count: null, error: `${error.code ?? ""} ${error.message}`.trim() };
    return { count: count ?? 0 };
  } catch (e) {
    return { count: null, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Đã chạy supabase/nguoi-soan.sql chưa (bảng editors + cột lessons.owner_id). */
async function checkEditorsSetup(): Promise<{ ok: boolean; error?: string }> {
  try {
    const sb = getSupabaseServer();
    const [a, b] = await Promise.all([
      sb.from("editors").select("email", { count: "exact", head: true }),
      sb.from("lessons").select("owner_id", { count: "exact", head: true }),
    ]);
    const err = a.error ?? b.error;
    return err ? { ok: false, error: `${err.code ?? ""} ${err.message}`.trim() } : { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function Pill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {children}
    </span>
  );
}

/**
 * Đang trỏ vào project Supabase nào. URL là biến NEXT_PUBLIC_* nên vốn đã lộ ra
 * trình duyệt — hiện ở đây không thêm rủi ro gì, mà lại cho biết ngay có đúng
 * project không. Service role key CHỈ báo có/không, tuyệt đối không in giá trị.
 */
function readTarget() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  let host = "";
  try {
    host = raw ? new URL(raw).host : "";
  } catch {
    host = raw; // URL sai định dạng — hiện nguyên văn để còn thấy mà sửa
  }
  return {
    host,
    projectRef: host.split(".")[0] || "",
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export default async function ConfigCheckPage() {
  const blocked = await adminOnly();
  if (blocked) return blocked;
  const target = readTarget();

  const [subjects, chapters, lessons, questions, editorsSetup] = await Promise.all([
    readSubjects(),
    countTable("chapters"),
    countTable("lessons"),
    countTable("questions"),
    checkEditorsSetup(),
  ]);

  const dbOk = subjects.rows !== null;
  const byGrade = new Map<number, string[]>();
  const stats = new Map<string, Row>();
  for (const r of subjects.rows ?? []) {
    if (!byGrade.has(r.grade)) byGrade.set(r.grade, []);
    byGrade.get(r.grade)!.push(r.name);
    stats.set(`${r.grade}|${r.name}`, r);
  }

  const grades = GRADES.map((g) => {
    const code = [...getSubjects(g)];
    const db = byGrade.get(g) ?? [];
    return {
      grade: g,
      code,
      db,
      missing: code.filter((n) => !db.includes(n)),
      extra: db.filter((n) => !code.includes(n)),
    };
  });
  const totalExtra = grades.reduce((sum, g) => sum + g.extra.length, 0);
  const hiddenWithContent = grades.reduce(
    (sum, g) => sum + g.extra.filter((n) => (stats.get(`${g.grade}|${n}`)?.filled ?? 0) > 0).length,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-extrabold text-gray-800 mb-1">Kiểm tra cấu hình</h1>
        <p className="text-sm text-gray-500 mb-6">
          Trang chẩn đoán — mở được trên điện thoại, không cần chạy lệnh. Chỉ đọc, không sửa gì.
        </p>

        {/* Nhiều người soạn */}
        <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Nhiều người soạn đề</h2>
          <p className="text-xs text-gray-600">
            Bảng <code>editors</code> và cột <code>lessons.owner_id</code>:{" "}
            {editorsSetup.ok ? <Pill ok>đã có</Pill> : <Pill ok={false}>chưa có</Pill>}
          </p>
          {!editorsSetup.ok && (
            <p className="mt-1 text-[11px] text-gray-500">
              Chạy file <code>supabase/nguoi-soan.sql</code> trong Supabase SQL Editor. ({editorsSetup.error})
            </p>
          )}
        </section>

        {/* Kết nối DB */}
        <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Kết nối Supabase</h2>

          <div className="mb-3 space-y-1 rounded-xl bg-gray-50 p-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-2">
              <span className="text-gray-400">Đang trỏ tới project:</span>
              <b className="break-all text-gray-700">{target.projectRef || "(chưa cấu hình)"}</b>
            </div>
            <div className="flex flex-wrap items-center gap-x-2">
              <span className="text-gray-400">Địa chỉ:</span>
              <code className="break-all text-gray-600">{target.host || "(trống)"}</code>
            </div>
            <div className="flex flex-wrap items-center gap-x-2">
              <span className="text-gray-400">SUPABASE_SERVICE_ROLE_KEY:</span>
              {target.hasServiceKey ? (
                <Pill ok>đã có</Pill>
              ) : (
                <Pill ok={false}>chưa đặt</Pill>
              )}
            </div>
            <p className="pt-1 text-[11px] text-gray-400">
              Mở supabase.com và đối chiếu: project ở trên có tồn tại và đang chạy không? Gói miễn
              phí tự tạm dừng project sau một thời gian không dùng — lúc đó địa chỉ này ngừng hoạt
              động và mọi kết nối đều hỏng.
            </p>
          </div>

          {dbOk ? (
            <>
              <Pill ok>Kết nối được</Pill>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 sm:grid-cols-4">
                <div className="rounded-lg bg-gray-50 px-2 py-1.5">
                  Môn: <b>{subjects.rows!.length}</b>
                </div>
                <div className="rounded-lg bg-gray-50 px-2 py-1.5">
                  Chương: <b>{chapters.count ?? "?"}</b>
                </div>
                <div className="rounded-lg bg-gray-50 px-2 py-1.5">
                  Bài: <b>{lessons.count ?? "?"}</b>
                </div>
                <div className="rounded-lg bg-gray-50 px-2 py-1.5">
                  Câu hỏi: <b>{questions.count ?? "?"}</b>
                </div>
              </div>
              {[chapters, lessons, questions].some((t) => t.error) && (
                <p className="mt-2 text-xs text-red-600">
                  Có bảng đọc lỗi:{" "}
                  {[chapters.error, lessons.error, questions.error].filter(Boolean).join(" · ")}
                </p>
              )}
            </>
          ) : (
            <>
              <Pill ok={false}>Không kết nối được</Pill>
              <p className="mt-2 break-words text-xs text-red-600">{subjects.error}</p>
              <p className="mt-2 text-xs text-gray-500">
                Kiểm tra <code>NEXT_PUBLIC_SUPABASE_URL</code> và{" "}
                <code>SUPABASE_SERVICE_ROLE_KEY</code> trong env của Vercel.
              </p>
            </>
          )}
        </section>

        {/* Đối chiếu môn học */}
        <section className="bg-white rounded-2xl border border-gray-100 p-4">
          <h2 className="text-sm font-bold text-gray-700">Môn học: code ↔ DB</h2>
          <p className="mt-1 mb-3 text-xs text-gray-500">
            Danh mục nằm ở <code>lib/subjects.ts</code>. Môn có trong DB mà thiếu trong code thì
            nội dung của môn đó <b>không hiện lên web</b>.
          </p>

          {!dbOk ? (
            <p className="text-xs text-gray-400">Chưa đọc được DB nên không đối chiếu được.</p>
          ) : (
            <div className="space-y-3">
              {grades.map((g) => (
                <div key={g.grade} className="rounded-xl border border-gray-100 p-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">Lớp {g.grade}</span>
                    {g.extra.some((n) => (stats.get(`${g.grade}|${n}`)?.filled ?? 0) > 0) ? (
                      <Pill ok={false}>có môn bị ẩn</Pill>
                    ) : g.extra.length ? (
                      <Pill ok>khớp · {g.extra.length} môn trống trong DB</Pill>
                    ) : (
                      <Pill ok>khớp</Pill>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="text-gray-400">code:</span> {g.code.join(", ") || "(trống)"}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="text-gray-400">DB:</span> {g.db.join(", ") || "(trống)"}
                  </p>
                  {g.extra.map((name) => {
                    const st = stats.get(`${g.grade}|${name}`);
                    const hasContent = !!st && st.filled > 0;
                    return hasContent ? (
                      <p key={name} className="mt-1.5 text-xs text-red-600">
                        ❌ <b>{name}</b>: có nội dung đang bị ẩn — {st.chapters} chương, {st.filled} bài có câu hỏi
                        ({st.questions} câu). Thêm môn này vào <code>lib/subjects.ts</code> để hiện lại.
                      </p>
                    ) : (
                      <div key={name} className="mt-1.5 text-xs text-gray-600">
                        <p>
                          ○ <b>{name}</b>: không có bài nào có câu hỏi
                          {st && st.lessons > 0 ? ` (${st.chapters} chương, ${st.lessons} bài trống)` : st && st.chapters > 0 ? ` (${st.chapters} chương trống)` : ""}
                          {" "}— chỉ là dòng còn sót, web không mất gì. Muốn dọn thì chạy trong Supabase SQL Editor
                          {st && st.chapters > 0 ? " (xoá luôn các chương, bài trống bên trong)" : ""}:
                        </p>
                        <code className="mt-1 block break-all rounded bg-gray-50 px-2 py-1 text-[11px] text-gray-700">
                          DELETE FROM subjects WHERE grade = {g.grade} AND name = &apos;{name.replace(/'/g, "''")}&apos;;
                        </code>
                      </div>
                    );
                  })}
                  {g.missing.length > 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      ⚠ Khai báo trong code nhưng DB chưa có: {g.missing.join(", ")} — sẽ tự tạo khi
                      lưu bài đầu tiên.
                    </p>
                  )}
                </div>
              ))}
              <p className="pt-1 text-xs font-medium text-gray-600">
                {totalExtra > 0
                  ? `Tổng ${totalExtra} môn trong DB không có trong code — ${hiddenWithContent} môn trong đó có bài thật đang bị ẩn.`
                  : "Không có môn nào bị ẩn."}
              </p>
            </div>
          )}
        </section>

        <div className="mt-5 flex gap-3 text-sm">
          <Link href="/import/exam" className="font-semibold text-blue-600 hover:underline">
            → Tạo đề kiểm tra
          </Link>
          <Link href="/" className="text-gray-500 hover:underline">
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
