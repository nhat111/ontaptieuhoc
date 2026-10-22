import { CheckCircle2, ChevronDown, Lightbulb } from "lucide-react";
import MathText from "@/components/MathText";
import type { Question } from "@/lib/quizData";

/** Đáp án đúng để hiện cho người xem (multi: nhiều đáp án; short: cách viết đầu tiên). */
function answerText(q: Question): string {
  if (q.type === "multi") {
    try {
      return (JSON.parse(q.correctAnswer) as string[]).join("; ");
    } catch {
      return q.correctAnswer;
    }
  }
  if (q.type === "short") return q.correctAnswer.split("|")[0];
  return q.correctAnswer;
}

/**
 * "Cách làm · Ví dụ giải mẫu" trên màn hình bắt đầu của bài Toán theo sách: mỗi dạng câu
 * của bài một ví dụ có đáp án và lời giải (lib/sgk → buildSgkExamples). Gập/mở bằng
 * <details>, ví dụ đầu mở sẵn.
 */
export default function WorkedExamples({ examples }: { examples: Question[] }) {
  if (examples.length === 0) return null;
  return (
    <section className="mt-6 text-left" aria-label="Ví dụ giải mẫu">
      <h2 className="mb-1 flex items-center gap-2 text-base font-extrabold text-slate-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-star-100 text-star-700" aria-hidden>
          <Lightbulb className="h-4 w-4" />
        </span>
        Cách làm · Ví dụ giải mẫu
      </h2>
      <p className="mb-3 text-sm text-slate-500">
        Xem cách giải {examples.length} dạng câu có trong bài, rồi bấm Bắt đầu làm bài.
      </p>
      <div className="space-y-2">
        {examples.map((q, i) => (
          <details key={i} open={i === 0} className="group overflow-hidden rounded-xl border border-slate-200 bg-white">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 text-sm">
                <span className="block text-xs font-bold text-star-700">Dạng {i + 1}</span>
                <span className="line-clamp-2 font-semibold text-slate-800">
                  <MathText text={q.question} />
                </span>
              </span>
              <ChevronDown className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="space-y-3 border-t border-slate-100 px-4 pb-4 pt-3 text-sm text-slate-700">
              {q.images?.map((img, ii) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={ii}
                  src={img.url}
                  alt={`Hình minh hoạ dạng ${i + 1}`}
                  className="max-h-48 max-w-full rounded-lg border border-slate-200 bg-white object-contain"
                />
              ))}
              {(q.type === "mcq" || q.type === "multi") && q.options.length > 0 && (
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {q.options.map((o, oi) => {
                    const right = q.type === "multi" ? answerText(q).split("; ").includes(o) : o === q.correctAnswer;
                    return (
                      <li
                        key={oi}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
                          right ? "border-success-300 bg-success-50 font-semibold text-success-800" : "border-slate-200"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-400">{String.fromCharCode(65 + oi)}.</span>
                        <MathText text={o} />
                        {right && <CheckCircle2 className="ml-auto h-4 w-4 flex-shrink-0 text-success-600" aria-label="Đáp án đúng" />}
                      </li>
                    );
                  })}
                </ul>
              )}
              <p>
                <span className="font-semibold text-success-700">Đáp án: </span>
                <MathText text={answerText(q)} />
              </p>
              {q.explanation?.trim() && (
                <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                  <p className="mb-0.5 text-xs font-semibold text-amber-700">Lời giải</p>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    <MathText text={q.explanation} />
                  </div>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
