import Link from "next/link";
import type { ReactNode } from "react";
import Header from "@/components/Header";

// Khung chung cho các trang hướng dẫn (/huong-dan, /huong-dan/soan-de):
// đầu trang có bạn Cú, mục lục, các bước đánh số, hỏi đáp, lời chốt.

export type GuideStep = {
  id: string;
  emoji: string;
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="border-b border-amber-100 bg-[#FFF9EE]">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-10">
          <span className="text-6xl motion-safe:animate-float" aria-hidden>🦉</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{title}</h1>
            <p className="mt-1 text-gray-600">{intro}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {switchTo && (
          <Link
            href={switchTo.href}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 hover:border-blue-300"
          >
            <span className="flex-1">
              <span className="block font-bold text-blue-800">{switchTo.label}</span>
              <span className="block text-sm text-blue-700/80">{switchTo.desc}</span>
            </span>
            <span className="font-bold text-blue-600">›</span>
          </Link>
        )}

        <nav aria-label="Mục lục" className="mb-8 flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600"
            >
              {i + 1}. {s.title.replace(/ \(.*\)$/, "")}
            </a>
          ))}
          <a
            href="#hoi-dap"
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-600"
          >
            ❓ Hỏi đáp
          </a>
        </nav>

        <ol className="space-y-5">
          {steps.map((s, i) => (
            <li key={s.id} id={s.id} className="scroll-mt-24 rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl" aria-hidden>
                  {s.emoji}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Bước {i + 1}</p>
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">{s.title}</h2>
                </div>
              </div>
              <ul className="space-y-2 text-[15px] leading-relaxed text-gray-700">
                {s.points.map((p, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="mt-0.5 text-green-600">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              {s.tip && <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">💡 {s.tip}</p>}
              {s.cta && (
                <Link
                  href={s.cta.href}
                  className="mt-4 inline-flex items-center gap-1 rounded-2xl border-b-4 border-blue-800 bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-500 active:translate-y-0.5 active:border-b-2"
                >
                  {s.cta.label} →
                </Link>
              )}
            </li>
          ))}
        </ol>

        <section id="hoi-dap" className="scroll-mt-24 mt-10">
          <h2 className="mb-4 text-xl font-extrabold text-gray-800">❓ Hỏi đáp nhanh</h2>
          <div className="space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-gray-800">
                  {f.q}
                  <span className="text-gray-400 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div className="mt-2 text-[15px] leading-relaxed text-gray-600">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-10 rounded-3xl border border-amber-200 bg-[#FFF9EE] p-6 text-center">
          <p className="text-lg font-extrabold text-gray-800">{outro.title}</p>
          <p className="mt-1 text-gray-600">{outro.desc}</p>
          <Link
            href={outro.href}
            className="mt-4 inline-flex rounded-2xl border-b-4 border-blue-800 bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-500 active:translate-y-0.5 active:border-b-2"
          >
            {outro.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
