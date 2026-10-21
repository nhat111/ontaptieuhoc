import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText, Gamepad2, Inbox, PenLine, Plus, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import SubjectTabs from "@/components/SubjectTabs";
import ChapterItem from "@/components/ChapterItem";
import Sidebar from "@/components/Sidebar";
import { getChaptersWithLessons, getLeaderboardByGrade } from "@/lib/db";
import { getSubjects, getDefaultSubject, resolveSubject } from "@/lib/subjects";
import { gradeTheme } from "@/lib/gradeTheme";
import { hasQuickExam } from "@/lib/quickExam";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ grade: string }>;
  searchParams: Promise<{ subject?: string; view?: string }>;
}): Promise<Metadata> {
  const { grade } = await params;
  const { subject: subjectParam, view } = await searchParams;
  const isExam = view === "exam";

  const gradeNum = parseInt(grade);
  const subjectName = resolveSubject(gradeNum, subjectParam) ?? "";

  // A grade with no subjects yet leaves subjectName empty, which would
  // otherwise leave a double space in the middle of the sentence.
  const squish = (s: string) => s.replace(/\s+/g, " ").trim();

  const kind = isExam ? "Đề kiểm tra" : "Bài tập";
  const title = squish(`${kind} ${subjectName} lớp ${grade}`);
  const description = squish(
    isExam
      ? `Tổng hợp đề kiểm tra ${subjectName} lớp ${grade} theo chương, có đáp án. Làm bài trực tuyến miễn phí và chấm điểm ngay.`
      : `Bài tập ${subjectName} lớp ${grade} bám sát sách giáo khoa, chia theo chương và theo bài. Luyện tập trực tuyến miễn phí, chấm điểm ngay.`
  );

  // Canonical drops the default subject so /lop/3 and /lop/3?subject=<first>
  // are not indexed as two separate pages. An unknown ?subject= resolves back
  // to the default too, so it collapses onto the same canonical.
  const isDefaultSubject = subjectName === getDefaultSubject(gradeNum);
  const query = [
    !isDefaultSubject ? `subject=${encodeURIComponent(subjectParam!)}` : null,
    isExam ? "view=exam" : null,
  ]
    .filter(Boolean)
    .join("&");
  const canonical = `/lop/${grade}${query ? `?${query}` : ""}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}

// Lớp có khu trò chơi (/lop/[grade]/tro-choi) → một dòng giới thiệu trên trang lớp.
const GAME_BLURB: Record<number, string> = {
  1: "Toán và Tiếng Việt: đếm hình, hái táo, so sánh số, chọn chữ, chọn dấu",
  2: "Xem đồng hồ, tính nhẩm, tiền Việt Nam, chính tả, phân loại từ",
  3: "Đua xe bảng nhân, bắn bóng bay, chỉnh đồng hồ, làm tròn số, lật thẻ từ",
  4: "Phân số, đổi đơn vị đo, danh từ – động từ – tính từ",
  5: "Số thập phân, tỉ số phần trăm, kết từ",
};

export default async function GradePage({
  params,
  searchParams,
}: {
  params: Promise<{ grade: string }>;
  searchParams: Promise<{ subject?: string; view?: string }>;
}) {
  const { grade } = await params;
  const { subject: subjectParam, view } = await searchParams;
  const activeView = view === "exam" ? "exam" : "baitap";
  const gradeNum = parseInt(grade);
  const theme = gradeTheme(gradeNum);

  // Môn học lấy từ lib/subjects.ts — không query DB nữa.
  const subjects = getSubjects(gradeNum);
  const activeSubject = resolveSubject(gradeNum, subjectParam);

  const [chapters, leaderboard] = await Promise.all([
    activeSubject
      ? getChaptersWithLessons(gradeNum, activeSubject, activeView === "exam" ? "exam" : "lesson")
      : Promise.resolve([]),
    getLeaderboardByGrade(gradeNum),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Subject tabs bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <SubjectTabs
            subjects={[...subjects]}
            activeSubject={activeSubject ?? undefined}
            grade={grade}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Đường dẫn" className="flex items-center gap-1 text-xs text-slate-400 mb-5">
          <Link href="/" className="hover:text-slate-700 transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <Link href={`/lop/${grade}`} className="hover:text-slate-700 transition-colors">Lớp {grade}</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="text-slate-600">{activeSubject ?? "Toán"}</span>
        </nav>

        {/* Tiêu đề: ô số lớp tô màu lớp, phần còn lại trung tính */}
        <div className="mb-6 flex items-center gap-4">
          <span
            className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-b-4 ${theme.edge} ${theme.soft} ${theme.text} text-4xl font-black tabular-nums`}
            aria-hidden
          >
            {grade}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {activeView === "exam" ? "Đề kiểm tra" : "Bài tập"} {activeSubject ?? "Toán"}
              <span className="text-slate-400 font-medium"> · Lớp {grade}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {activeView === "exam"
                ? "Đề kiểm tra theo chương · Luyện thi cuối kỳ"
                : "Bám sát sách giáo khoa · Luyện từng chương, từng bài"}
            </p>
          </div>
        </div>

        {GAME_BLURB[gradeNum] && (
          <Link
            href={`/lop/${gradeNum}/tro-choi`}
            className="group mb-6 flex items-center gap-3 rounded-2xl border border-star-200 bg-gradient-to-r from-star-50 to-white px-4 py-3 shadow-soft transition-all hover:border-star-300 motion-safe:hover:-translate-y-0.5"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-star-400 text-white shadow-sm" aria-hidden>
              <Gamepad2 className="h-6 w-6" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-extrabold text-slate-900">Vừa học vừa chơi</span>
              <span className="block text-sm text-slate-600 truncate">{GAME_BLURB[gradeNum]}</span>
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-primary-700 ring-1 ring-star-200">
              Chơi
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        )}

        {/* Môn có đề tự sinh (lib/quickExam.ts): mời tạo đề giữa kì / cuối kì ngay. */}
        {activeView === "exam" && activeSubject && hasQuickExam(gradeNum, activeSubject) && (
          <Link
            href={`/tao-de?lop=${gradeNum}&mon=${encodeURIComponent(activeSubject)}`}
            className="group mb-6 flex items-center gap-3 rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 to-white px-4 py-3 shadow-soft transition-all hover:border-primary-300 motion-safe:hover:-translate-y-0.5"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm" aria-hidden>
              <Sparkles className="h-6 w-6" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-extrabold text-slate-900">Tạo đề nhanh</span>
              <span className="block text-sm text-slate-600">Đề giữa kì, cuối kì {activeSubject} lớp {gradeNum} mới mỗi lần bấm, có đáp án</span>
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-primary-700 ring-1 ring-primary-200">
              Tạo đề
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        )}

        {/* Tiếng Việt lớp 5: hướng dẫn phần Kiểm tra viết (lib/lamVan.ts). */}
        {gradeNum === 5 && activeSubject === "Tiếng Việt" && (
          <Link
            href="/lam-van/lop-5"
            className="group mb-6 flex items-center gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white px-4 py-3 shadow-soft transition-all hover:border-violet-300 motion-safe:hover:-translate-y-0.5"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white shadow-sm" aria-hidden>
              <PenLine className="h-6 w-6" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-extrabold text-slate-900">Hướng dẫn làm văn</span>
              <span className="block text-sm text-slate-600">Tả cảnh, tả người, kể chuyện sáng tạo, nêu ý kiến — dàn ý và bài tham khảo</span>
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-primary-700 ring-1 ring-violet-200">
              Xem
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        )}

        {/* Bài tập / Đề kiểm tra: nút chuyển dạng segmented */}
        <div className="inline-flex mb-6 rounded-xl bg-slate-200/70 p-1">
          {[
            { key: "baitap", label: "Bài tập", href: `/lop/${grade}${subjectParam ? `?subject=${encodeURIComponent(subjectParam)}` : ""}` },
            { key: "exam", label: "Đề kiểm tra", href: `/lop/${grade}?${subjectParam ? `subject=${encodeURIComponent(subjectParam)}&` : ""}view=exam` },
          ].map((t) => (
            <a
              key={t.key}
              href={t.href}
              aria-current={activeView === t.key ? "page" : undefined}
              className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                activeView === t.key ? "bg-white text-primary-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </a>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Chapter / Exam list */}
          <div className="lg:col-span-2 space-y-4">
            {chapters.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-400" aria-hidden>
                  {activeView === "exam" ? <FileText className="h-5 w-5" /> : <Inbox className="h-5 w-5" />}
                </span>
                <p className="font-medium text-slate-600">
                  {activeView === "exam"
                    ? `Chưa có đề kiểm tra ${activeSubject ?? ""} lớp ${grade}`
                    : "Chưa có nội dung cho môn học này"}
                </p>
                {activeView === "exam" && (
                  <a
                    href={`/import/exam`}
                    className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Tạo đề kiểm tra mới
                  </a>
                )}
              </div>
            ) : (
              chapters.map((chapter, i) => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  defaultOpen={i === 0}
                  viewType={activeView === "exam" ? "exam" : "lesson"}
                  grade={gradeNum}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar leaderboard={leaderboard} grade={gradeNum} />
          </div>
        </div>
      </div>
    </div>
  );
}
