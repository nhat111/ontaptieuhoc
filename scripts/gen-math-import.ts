// scripts/gen-math-import.ts — đưa bài luyện tập Toán tự sinh (lib/mathGen) vào Supabase.
//
// Không gọi AI hay API ngoài: câu hỏi do code sinh ra, đáp án do máy tính tính.
// Mỗi lớp (1, 2, 5) có 1 chương "Luyện tập theo chủ đề", mỗi chủ đề là 1 bài 10 câu.
//
// Idempotent: chương/bài nhận diện qua `source_id` ("gen_…"). Chạy lại sẽ bỏ qua bài
// đã có câu hỏi. Muốn thay bộ đề mới cho bài đã import: thêm --replace (xoá câu cũ của
// đúng các bài "gen_…" đó rồi chèn lại — không đụng bài nhập tay hay bài NXBGD).
//
// Cần: NEXT_PUBLIC_SUPABASE_URL (hoặc SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
// (tự đọc từ .env.local nếu có).
//
// Chạy:
//   npx tsx scripts/gen-math-check.ts                         # kiểm tra trước (nên chạy)
//   npx tsx scripts/gen-math-import.ts --dry-run              # xem trước, không ghi DB
//   npx tsx scripts/gen-math-import.ts                        # import lớp 1, 2, 5
//   npx tsx scripts/gen-math-import.ts --grades 5             # chỉ lớp 5
//   npx tsx scripts/gen-math-import.ts --seed v2 --replace    # thay bằng bộ đề khác

import { MATH_LESSONS, buildLessonQuestions, type MathGrade } from "../lib/mathGen";

const SUBJECT = "Toán"; // phải khớp lib/subjects.ts
const CHAPTER_TITLE = "Luyện tập theo chủ đề";
const CHAPTER_ORDER = 1000; // xếp sau các chương theo sách

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const dryRun = process.argv.includes("--dry-run");
const replace = process.argv.includes("--replace");
const seed = arg("--seed") ?? "v1";
const grades = (arg("--grades") ?? "1,2,5").split(",").map(Number) as MathGrade[];

if (grades.some((g) => ![1, 2, 5].includes(g))) {
  console.error("--grades chỉ nhận 1, 2, 5 (VD: --grades 1,5)");
  process.exit(1);
}

// Đọc .env.local nếu chưa truyền biến môi trường (Node ≥ 20.12)
try {
  (process as unknown as { loadEnvFile?: (p: string) => void }).loadEnvFile?.(".env.local");
} catch {
  /* không có file thì thôi */
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!dryRun && (!supabaseUrl || !serviceKey)) {
  console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY (đặt trong .env.local)");
  process.exit(1);
}

// ── Supabase REST (giống scripts/nxbgd-import.mjs) ───────────────────────────

type Row = { id: number };

async function sb<T = Row[]>(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: serviceKey!,
      authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase ${method} ${path} → HTTP ${res.status}: ${text}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

const enc = encodeURIComponent;
const returning = { Prefer: "return=representation" };

async function findOrCreate(table: string, query: string, row: Record<string, unknown>): Promise<{ id: number; created: boolean }> {
  const found = await sb("GET", `${table}?${query}&select=id`);
  if (found.length > 0) return { id: found[0].id, created: false };
  const created = await sb("POST", `${table}?select=id`, row, returning);
  return { id: created[0].id, created: true };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Toán tự sinh → Supabase · lớp ${grades.join(", ")} · seed "${seed}"${dryRun ? " · DRY RUN" : ""}${replace ? " · REPLACE" : ""}`);
  const totals = { inserted: 0, replaced: 0, skipped: 0 };

  for (const grade of grades) {
    const specs = MATH_LESSONS.filter((l) => l.grade === grade);
    console.log(`\nLớp ${grade} — ${specs.length} bài`);

    if (dryRun) {
      for (const spec of specs) {
        const rows = buildLessonQuestions(spec, seed);
        console.log(`  • ${spec.title} (${rows.length} câu)`);
        for (const r of rows.slice(0, 3)) console.log(`      [${r.type}] ${r.content.slice(0, 90)}  →  ${r.correct_answer}`);
      }
      continue;
    }

    const subject = await findOrCreate("subjects", `grade=eq.${grade}&name=eq.${enc(SUBJECT)}`,
      { grade, name: SUBJECT, order_index: 99 });
    const chapter = await findOrCreate("chapters", `source_id=eq.gen_toan_lop_${grade}`,
      { title: CHAPTER_TITLE, subject_id: subject.id, order_index: CHAPTER_ORDER, source_id: `gen_toan_lop_${grade}` });
    console.log(`  chương "${CHAPTER_TITLE}": id=${chapter.id}${chapter.created ? " (mới tạo)" : ""}`);

    for (const [i, spec] of specs.entries()) {
      const sourceId = `gen_${spec.id}`;
      const lesson = await findOrCreate("lessons", `source_id=eq.${enc(sourceId)}`, {
        title: spec.title,
        index_label: String(i + 1).padStart(2, "0"),
        chapter_id: chapter.id,
        status: "active",
        order_index: i + 1,
        duration_minutes: 15,
        source_id: sourceId,
        type: "lesson",
      });

      const existing = await sb("GET", `questions?lesson_id=eq.${lesson.id}&select=id&limit=1`);
      if (existing.length > 0 && !replace) {
        console.log(`  – ${spec.title}: đã có câu hỏi, bỏ qua (thêm --replace để thay)`);
        totals.skipped++;
        continue;
      }
      if (existing.length > 0) await sb("DELETE", `questions?lesson_id=eq.${lesson.id}`);

      const rows = buildLessonQuestions(spec, seed).map((q, idx) => ({ ...q, lesson_id: lesson.id, order_index: idx + 1 }));
      await sb("POST", "questions", rows);
      if (existing.length > 0) totals.replaced++;
      else totals.inserted++;
      console.log(`  ✓ ${spec.title}: ${rows.length} câu (lesson id=${lesson.id}${existing.length > 0 ? ", đã thay" : ""})`);
    }
  }

  if (!dryRun) console.log(`\nXong: ${totals.inserted} bài mới, ${totals.replaced} bài thay đề, ${totals.skipped} bài bỏ qua.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
