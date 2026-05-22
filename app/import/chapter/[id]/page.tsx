import Link from "next/link";
import Header from "@/components/Header";
import { getChapterContext, getLessonsInChapter } from "@/lib/db";

export default async function ChapterDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chapterId = Number(id);
  if (!chapterId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-red-500">
          ID chương không hợp lệ.
        </div>
      </div>
    );
  }

  const [ctx, lessons] = await Promise.all([
    getChapterContext(chapterId),
    getLessonsInChapter(chapterId),
  ]);

  if (!ctx) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">
          Không tìm thấy chương.
        </div>
      </div>
    );
  }

  const filled = lessons.filter((l) => l.questionCount > 0).length;
  const empty = lessons.length - filled;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <nav className="flex flex-wrap items-center gap-1 text-xs mb-3">
            <Link href="/" className="text-blue-500 hover:underline">Trang chủ</Link>
            <span className="text-gray-400">›</span>
            <Link href={`/lop/${ctx.grade}`} className="text-blue-500 hover:underline">Lớp {ctx.grade}</Link>
            <span className="text-gray-400">›</span>
            <Link
              href={`/lop/${ctx.grade}?subject=${encodeURIComponent(ctx.subjectName)}`}
              className="text-blue-500 hover:underline"
            >
              {ctx.subjectName}
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-orange-500 font-medium">{ctx.chapterTitle}</span>
          </nav>

          <h1 className="text-xl font-extrabold text-gray-800 mb-1">{ctx.chapterTitle}</h1>
          <p className="text-sm text-gray-500">
            {ctx.subjectName} · Lớp {ctx.grade} · {lessons.length} bài
            {lessons.length > 0 && (
              <>
                {" "}— <span className="text-emerald-600 font-medium">{filled} đã nhập</span>
                {empty > 0 && <> · <span className="text-amber-600 font-medium">{empty} trống</span></>}
              </>
            )}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700">Danh sách bài</h2>
          <div className="flex gap-2">
            <Link
              href="/import"
              className="text-xs text-blue-600 hover:underline border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5"
            >
              + Tạo bài học
            </Link>
            <Link
              href="/import/exam"
              className="text-xs text-orange-600 hover:underline border border-orange-200 hover:border-orange-300 rounded-lg px-3 py-1.5"
            >
              + Tạo đề
            </Link>
          </div>
        </div>

        {lessons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            <p className="text-3xl mb-3">📚</p>
            <p className="text-sm">Chương này chưa có bài nào.</p>
          </div>
        ) : (
          <ul className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
            {lessons.map((l) => {
              const filled = l.questionCount > 0;
              const isExam = l.type === "exam";
              return (
                <li key={l.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      filled
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-400 border border-dashed border-gray-300"
                    }`}
                    title={filled ? "Đã nhập câu hỏi" : "Chưa có câu hỏi"}
                  >
                    {filled ? "✓" : "○"}
                  </span>
                  <span className="text-[11px] font-mono text-gray-400 w-8 flex-shrink-0">{l.indexLabel}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{l.title}</p>
                    <p className="text-[11px] text-gray-500">
                      {isExam ? "Đề kiểm tra · " : ""}
                      {l.questionCount} câu · {l.durationMinutes} phút
                    </p>
                  </div>
                  <Link
                    href={`/quiz?lessonId=${l.id}`}
                    className="text-xs text-blue-600 hover:underline px-2 py-1"
                  >
                    Xem
                  </Link>
                  <Link
                    href={`/import/edit/${l.id}`}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-3 py-1.5"
                  >
                    {filled ? "Sửa" : "Nhập"}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
