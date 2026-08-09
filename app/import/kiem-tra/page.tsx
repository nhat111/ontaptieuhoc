import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { getSupabaseServer } from "@/lib/supabase/server";
import { GRADES, getSubjects } from "@/lib/subjects";
import { getProvider } from "@/lib/tts";

// Trang chẩn đoán mở được bằng điện thoại — thay cho
// `node scripts/check-subjects.mjs` khi không ngồi máy tính.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kiểm tra cấu hình",
  robots: { index: false, follow: false },
};

type Row = { grade: number; name: string };

async function readSubjects(): Promise<{ rows: Row[] | null; error?: string }> {
  try {
    const { data, error } = await getSupabaseServer()
      .from("subjects")
      .select("grade, name")
      .order("grade");
    if (error) return { rows: null, error: `${error.code ?? ""} ${error.message}`.trim() };
    return { rows: (data ?? []) as Row[] };
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
  const target = readTarget();

  // Chỉ báo CÓ/KHÔNG, tuyệt đối không in giá trị key ra trang.
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasOpenai = !!process.env.OPENAI_API_KEY;
  const ttsProvider = getProvider();
  const [subjects, chapters, lessons, questions] = await Promise.all([
    readSubjects(),
    countTable("chapters"),
    countTable("lessons"),
    countTable("questions"),
  ]);

  const dbOk = subjects.rows !== null;
  const byGrade = new Map<number, string[]>();
  for (const r of subjects.rows ?? []) {
    if (!byGrade.has(r.grade)) byGrade.set(r.grade, []);
    byGrade.get(r.grade)!.push(r.name);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-extrabold text-gray-800 mb-1">Kiểm tra cấu hình</h1>
        <p className="text-sm text-gray-500 mb-6">
          Trang chẩn đoán — mở được trên điện thoại, không cần chạy lệnh. Chỉ đọc, không sửa gì.
        </p>

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

        {/* Giọng đọc đám mây */}
        <section className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          <h2 className="text-sm font-bold text-gray-700 mb-2">Giọng đọc tiếng Anh</h2>
          <div className="space-y-1 rounded-xl bg-gray-50 p-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-2">
              <span className="text-gray-400">Trạng thái:</span>
              <Pill ok={!!ttsProvider}>
                {ttsProvider ? `Đang bật — ${ttsProvider}` : "Chưa bật"}
              </Pill>
            </div>
            <div className="flex flex-wrap items-center gap-x-2">
              <span className="text-gray-400">GEMINI_API_KEY:</span>
              <Pill ok={hasGemini}>{hasGemini ? "có" : "chưa đặt"}</Pill>
            </div>
            <div className="flex flex-wrap items-center gap-x-2">
              <span className="text-gray-400">OPENAI_API_KEY:</span>
              <Pill ok={hasOpenai}>{hasOpenai ? "có" : "chưa đặt"}</Pill>
            </div>
          </div>
          {ttsProvider ? (
            <p className="mt-2 text-xs text-gray-500">
              Đề tiếng Anh sẽ đọc bằng giọng đám mây. Đề tiếng Việt vẫn dùng giọng máy của
              trình duyệt — đó là chủ ý, không phải lỗi.
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-500">
              Chưa có key nào nên mọi đề đều đọc bằng giọng máy của trình duyệt. Thêm{" "}
              <code>GEMINI_API_KEY</code> vào env của Vercel (nhớ tick cả{" "}
              <b>Production</b> lẫn <b>Preview</b>), rồi <b>Redeploy</b> — đổi biến môi trường
              xong bản đang chạy không tự nhận.
            </p>
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
                    {g.extra.length === 0 ? (
                      <Pill ok>khớp</Pill>
                    ) : (
                      <Pill ok={false}>{g.extra.length} môn bị ẩn</Pill>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    <span className="text-gray-400">code:</span> {g.code.join(", ") || "(trống)"}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="text-gray-400">DB:</span> {g.db.join(", ") || "(trống)"}
                  </p>
                  {g.extra.length > 0 && (
                    <p className="mt-1.5 text-xs text-red-600">
                      ❌ Có trong DB, thiếu trong code: <b>{g.extra.join(", ")}</b> — thêm vào
                      <code> lib/subjects.ts</code> để hiện lại.
                    </p>
                  )}
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
                  ? `Tổng ${totalExtra} môn trong DB đang bị ẩn khỏi web.`
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
