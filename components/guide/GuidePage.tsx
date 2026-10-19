import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Check, ChevronDown, ChevronRight, Lightbulb } from "lucide-react";
import Header from "@/components/Header";

// Khung chung cho các trang hướng dẫn (/huong-dan, /huong-dan/soan-de):
// tiêu đề, mục lục, các bước đánh số, hỏi đáp, lời chốt.

export type GuideStep = {
  id: string;
  title: string;
  points: ReactNode[];
  tip?: ReactNode;
  cta?: { href: string; label: string };
};

export type GuideFaq = { q: string; a: ReactNode };

interface Props {
  title: string;
  intro: ReactNode;
  steps: GuideStep[];
  faq: GuideFaq[];
  /** Thẻ chuyển sang trang hướng dẫn kia (phụ huynh ↔ người soạn đề). */
  switchTo?: { href: string; label: string; desc: string };
  outro: { title: string; desc: string; href: string; label: string };
}

export default function GuidePage({ title, intro, steps, faq, switchTo, outro }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 max-w-2xl text-slate-600">{intro}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {switchTo && (
          <Link
            href={switchTo.href}
            className="group mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-slate-300"
          >
            <span className="flex-1">
              <span className="block text-sm font-semibold text-slate-900">{switchTo.label}</span>
              <span className="block text-sm text-slate-500">{switchTo.desc}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-700" aria-hidden />
          </Link>
        )}

        <nav aria-label="Mục lục" className="mb-8 flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-300 hover:text-slate-900"
            >
              {i + 1}. {s.title.replace(/ \(.*\)$/, "")}
            </a>
          ))}
          <a
            href="#hoi-dap"
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-300 hover:text-slate-900"
          >
            Hỏi đáp
          </a>
        </nav>

        <ol className="space-y-5">
          {steps.map((s, i) => (
            <li key={s.id} id={s.id} className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold tabular-nums text-white" aria-hidden>
                  {i + 1}
                </span>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">{s.title}</h2>
              </div>
              <ul className="space-y-2 text-[15px] leading-relaxed text-slate-700">
                {s.points.map((p, j) => (
                  <li key={j} className="flex gap-2.5">
                    <Check className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              {s.tip && (
                <p className="mt-4 flex gap-2.5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" aria-hidden />
                  <span>{s.tip}</span>
                </p>
              )}
              {s.cta && (
                <Link
                  href={s.cta.href}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  {s.cta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </li>
          ))}
        </ol>

        <section id="hoi-dap" className="scroll-mt-24 mt-10">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900">Hỏi đáp nhanh</h2>
          <div className="space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="group rounded-xl border border-slate-200 bg-white px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-slate-900">
                  {f.q}
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="mt-2 text-[15px] leading-relaxed text-slate-600">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-lg font-semibold text-slate-900">{outro.title}</p>
          <p className="mt-1 text-slate-600">{outro.desc}</p>
          <Link
            href={outro.href}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            {outro.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
