import Link from "next/link";
import { BookOpen, ChevronDown, ChevronRight, Lightbulb, PenLine, Puzzle } from "lucide-react";
import { baiOf, skillsOf, type TvGuide, type TvSkill } from "@/lib/tvGuide";

/**
 * Tiếng Việt theo chủ điểm sách (lib/tvGuide): mỗi chủ điểm là một "chương" gập/mở,
 * gồm danh sách bài và hộp "Cách làm bài" cho từng dạng Luyện từ và câu, Viết.
 * Dùng <details> nên render hoàn toàn ở server, không cần JS.
 */
export default function TvChuDiemList({ guide }: { guide: TvGuide }) {
  return (
    <section className="space-y-4" aria-label="Cách làm bài theo chủ điểm">
      <div className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white px-4 py-3 shadow-soft">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white shadow-sm" aria-hidden>
          <Lightbulb className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="block font-extrabold text-slate-900">Cách làm bài theo chủ điểm</span>
          <span className="block text-sm text-slate-600">
            {guide.book} · {guide.chuDiem.length} chủ điểm, mở từng chủ điểm để xem bài học và cách làm
          </span>
        </span>
      </div>

      {guide.chuDiem.map((cd, i) => {
        const bai = baiOf(guide, cd);
        const { ltvc, viet } = skillsOf(guide, cd);
        return (
          <details
            key={cd.so}
            open={i === 0}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/70 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">
                <span className="block text-xs font-bold text-violet-600">
                  Chủ điểm {cd.so} · Tập {cd.tap}, bài {cd.tu}–{cd.den}
                </span>
                <span className="block text-base font-extrabold text-slate-900">{cd.ten}</span>
              </span>
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" aria-hidden />
              </span>
            </summary>

            <div className="space-y-5 border-t border-slate-100 px-5 pb-5 pt-4">
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                  <BookOpen className="h-4 w-4 text-primary-600" aria-hidden /> Bài học trong chủ điểm
                </h4>
                <ol className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                  {bai.map((b) => (
                    <li key={b.so} className="flex gap-3 px-3 py-2 text-sm">
                      <span className="w-12 flex-shrink-0 font-bold text-slate-400">Bài {b.so}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-slate-800">{b.doc}</span>
                        <span className="block text-xs text-slate-500">
                          {[b.ltvc && `Luyện từ và câu: ${b.ltvc.ten}`, vietLabel(b.viet.ten), b.them]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-xl bg-primary-50/60 px-4 py-3">
                <h4 className="mb-1 text-sm font-extrabold text-slate-900">Đọc hiểu</h4>
                <p className="text-sm text-slate-700">{cd.docHieu}</p>
                <p className="mt-1 text-sm text-slate-700">
                  Đọc câu hỏi trước, rồi đọc bài và gạch chân chỗ có câu trả lời. Trả lời đủ câu, dùng từ ngữ trong bài.
                </p>
              </div>

              {ltvc.length > 0 && (
                <SkillGroup title="Luyện từ và câu" icon={<Puzzle className="h-4 w-4 text-star-600" aria-hidden />} skills={ltvc} />
              )}
              <SkillGroup title="Viết" icon={<PenLine className="h-4 w-4 text-success-600" aria-hidden />} skills={viet} />
            </div>
          </details>
        );
      })}

      <p className="px-1 text-xs text-slate-400">
        Hướng dẫn và ví dụ do Ôn Tập Cùng Con tự soạn theo mục lục sách, không chép sách giáo khoa.
      </p>
    </section>
  );
}

/** “Nghe - viết: …”, “Ôn chữ viết hoa …” đã tự nói là phần Viết, không thêm tiền tố. */
function vietLabel(ten: string) {
  return /^(Nghe|Nhớ) - viết|^Ôn/.test(ten) ? ten : `Viết: ${ten}`;
}

function SkillGroup({ title, icon, skills }: { title: string; icon: React.ReactNode; skills: TvSkill[] }) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
        {icon} {title}: cách làm
      </h4>
      <div className="space-y-2">
        {skills.map((s) => (
          <details key={s.id} className="group/skill rounded-xl border border-slate-200">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-bold text-slate-800 [&::-webkit-details-marker]:hidden">
              {s.ten}
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open/skill:rotate-180" aria-hidden />
            </summary>
            <div className="space-y-3 border-t border-slate-100 px-3 pb-3 pt-2 text-sm text-slate-700">
              <p>{s.laGi}</p>
              <ol className="list-decimal space-y-1 pl-5">
                {s.cachLam.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ol>
              {s.viDu && (
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="font-semibold text-slate-800">Ví dụ: {s.viDu.de}</p>
                  {s.viDu.cau && <p className="mt-1 italic">{s.viDu.cau}</p>}
                  <p className="mt-1">
                    <span className="font-semibold text-success-700">Trả lời: </span>
                    {s.viDu.dapAn}
                  </p>
                </div>
              )}
              {s.loi && (
                <p className="text-coral-700">
                  <span className="font-semibold">Lỗi hay mắc: </span>
                  {s.loi}
                </p>
              )}
              {s.link && (
                <Link href={s.link.href} className="inline-flex items-center gap-0.5 font-semibold text-primary-700 hover:underline">
                  {s.link.label}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
