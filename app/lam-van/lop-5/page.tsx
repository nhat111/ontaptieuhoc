import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ClipboardCheck, Lightbulb, PenLine, Timer } from "lucide-react";
import Header from "@/components/Header";
import { Card, Crumbs, Example, FormBadge, QuickExamCta } from "@/components/lamVan/parts";
import { GENERAL_TIPS, GUIDES, RUBRIC, STEPS } from "@/lib/lamVan";
import { pointsText } from "@/lib/exam5/paper";

const TITLE = "Hướng dẫn làm văn lớp 5";
const DESCRIPTION =
  "Cách làm bài văn, đoạn văn Tiếng Việt lớp 5 cho hay và đúng ý: tả cảnh, tả người, kể chuyện sáng tạo, nêu cảm xúc về nhân vật, nêu ý kiến. Có dàn ý, mở bài, kết bài mẫu và bài tham khảo.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/lam-van/lop-5" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/lam-van/lop-5" },
};

export default function LamVanLop5Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <section className="border-b border-violet-100 bg-gradient-to-br from-violet-50 via-primary-50 to-sky-50">
        <div className="mx-auto max-w-3xl px-4 pb-8 pt-6">
          <Crumbs items={[{ href: "/", label: "Trang chủ" }, { href: "/lop/5", label: "Lớp 5" }, { label: "Hướng dẫn làm văn" }]} />
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-soft ring-1 ring-violet-100" aria-hidden>
            <PenLine className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{TITLE}</h1>
          <p className="mt-2 text-slate-600">
            Phần <b>B. Kiểm tra viết</b> trong đề Tiếng Việt chiếm 10 điểm. Ở đây có cách làm từng dạng bài hay gặp ở lớp 5:
            đọc đề thế nào, lập dàn ý ra sao, viết gì cho hay, và tự soát bài trước khi nộp.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
        <Card id="dang-bai" title="Em đang gặp dạng bài nào?" icon={<PenLine className="h-4 w-4" />}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {GUIDES.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/lam-van/lop-5/${g.id}`}
                  className="group flex h-full flex-col rounded-2xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-violet-300 hover:shadow-pop motion-safe:hover:-translate-y-0.5"
                >
                  <span className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-900">{g.name}</span>
                    <FormBadge form={g.form} />
                  </span>
                  <span className="flex-1 text-sm leading-relaxed text-slate-600">{g.blurb}</span>
                  <span className="mt-3 inline-flex items-center gap-0.5 text-sm font-bold text-primary-700">
                    Xem cách làm
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card id="40-phut" title="Làm bài trong 40 phút" icon={<Timer className="h-4 w-4" />}>
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500 text-sm font-black text-white" aria-hidden>
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold text-slate-900">
                    {s.title} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{s.minutes}</span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card id="meo" title="Mẹo để bài viết hay hơn" icon={<Lightbulb className="h-4 w-4" />}>
          <ul className="space-y-4">
            {GENERAL_TIPS.map((t) => (
              <li key={t.title}>
                <p className="font-bold text-slate-900">{t.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{t.text}</p>
                {t.example && <Example>{t.example}</Example>}
              </li>
            ))}
          </ul>
        </Card>

        <Card id="cham-diem" title="Bài viết được chấm thế nào?" icon={<ClipboardCheck className="h-4 w-4" />}>
          <p className="mb-3 text-sm text-slate-600">
            Gợi ý biểu điểm 10 điểm — giống phần hướng dẫn chấm in kèm đề ở <Link href="/tao-de" className="font-semibold text-primary-700 hover:underline">Tạo đề nhanh</Link>. Đề của trường có thể chia điểm khác đôi chút.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["bai-van", "doan-van"] as const).map((form) => (
              <div key={form} className="rounded-xl border border-slate-200">
                <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-700">
                  {form === "bai-van" ? "Bài văn" : "Đoạn văn"}
                </p>
                <ul className="divide-y divide-slate-100 text-sm">
                  {RUBRIC[form].map(([label, pts]) => (
                    <li key={label} className="flex items-start justify-between gap-3 px-3 py-2">
                      <span className="text-slate-700">{label}</span>
                      <span className="whitespace-nowrap font-bold tabular-nums text-star-700">{pointsText(pts)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <QuickExamCta />
      </div>
    </div>
  );
}
