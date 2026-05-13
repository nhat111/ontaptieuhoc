import Link from "next/link";
import { getSubjectsByGrade } from "@/lib/db";

const GRADES = [1, 2, 3, 4, 5];

const GRADE_META: Record<number, { emoji: string; desc: string; color: string; bg: string }> = {
  1: { emoji: "🌱", desc: "Nền tảng đầu tiên", color: "#f97316", bg: "#fff7ed" },
  2: { emoji: "🌿", desc: "Phát triển tư duy",  color: "#16a34a", bg: "#f0fdf4" },
  3: { emoji: "🌸", desc: "Mở rộng kiến thức", color: "#db2777", bg: "#fdf2f8" },
  4: { emoji: "⭐", desc: "Nâng cao kỹ năng",  color: "#2563eb", bg: "#eff6ff" },
  5: { emoji: "🏆", desc: "Hoàn thiện tiểu học",color: "#c84b2f", bg: "#fef2ee" },
};

export default async function HomePage() {
  const subjectCounts: Record<number, number> = {};
  await Promise.all(
    GRADES.map(async (g) => {
      const subjects = await getSubjectsByGrade(g);
      subjectCounts[g] = subjects.length;
    })
  );

  return (
    <main className="min-h-screen bg-[#faf7f2]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-10 text-center">
        <div className="text-4xl mb-3">📚</div>
        <h1 className="text-2xl font-black text-white mb-2">
          Ôn Tập Tiểu Học
        </h1>
        <p className="text-orange-100 text-sm max-w-xs mx-auto">
          Luyện tập vui, học giỏi mỗi ngày — dành cho học sinh lớp 1 đến lớp 5
        </p>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6 bg-white px-4 py-4 border-b border-gray-100 text-center">
        {[
          { value: "500+", label: "Bài tập" },
          { value: "5", label: "Lớp học" },
          { value: "Free", label: "Miễn phí" },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-lg font-black text-orange-500">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grade list */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
          Chọn lớp của bạn
        </h2>
        <div className="flex flex-col gap-3">
          {GRADES.map((grade) => {
            const meta = GRADE_META[grade];
            return (
              <Link
                key={grade}
                href={`/lop/${grade}`}
                className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group"
              >
                {/* Emoji */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: meta.bg }}
                >
                  {meta.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-800 text-base">Lớp {grade}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{meta.desc}</p>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {Array.from({ length: subjectCounts[grade] || 0 }, (_, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: meta.color }}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-0.5">
                      {subjectCounts[grade]} môn
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <span
                  className="text-xl font-bold flex-shrink-0 group-hover:translate-x-1 transition-transform"
                  style={{ color: meta.color }}
                >
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
