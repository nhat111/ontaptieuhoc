import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle, BookOpen, ClipboardCheck, FileQuestion, ListTree, Lightbulb, MessageSquareQuote, Palette,
} from "lucide-react";
import Header from "@/components/Header";
import SelfCheck from "@/components/lamVan/SelfCheck";
import { Card, Crumbs, Example, FormBadge, QuickExamCta } from "@/components/lamVan/parts";
import { CHECKLIST, FORM_CHECK, GUIDES, guideById, promptsForGuide } from "@/lib/lamVan";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ dang: g.id }));
}

interface Props {
  params: Promise<{ dang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = guideById((await params).dang);
  if (!g) return {};
  const title = `${g.title} – Tiếng Việt lớp 5`;
  const description = `${g.blurb} Dàn ý, cách viết cho hay, mở bài – kết bài mẫu, từ ngữ gợi ý, bài tham khảo và bảng tự kiểm tra.`;
  const url = `/lam-van/lop-5/${g.id}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url } };
}

const PART_COLORS = ["bg-sky-50 text-sky-700 ring-sky-200", "bg-violet-50 text-violet-700 ring-violet-200", "bg-success-50 text-success-700 ring-success-200"];

export default async function LamVanGuidePage({ params }: Props) {
  const g = guideById((await params).dang);
  if (!g) notFound();
  const prompts = promptsForGuide(g.id);
  const others = GUIDES.filter((o) => o.id !== g.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <section className="border-b border-violet-100 bg-gradient-to-br from-violet-50 via-primary-50 to-sky-50">
        <div className="mx-auto max-w-3xl px-4 pb-8 pt-6">
          <Crumbs
            items={[
              { href: "/", label: "Trang chủ" },
              { href: "/lop/5", label: "Lớp 5" },
              { href: "/lam-van/lop-5", label: "Hướng dẫn làm văn" },
              { label: g.name },
            ]}
          />
          <FormBadge form={g.form} />
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{g.title}</h1>
          <p className="mt-2 text-slate-600">{g.blurb}</p>
          <nav aria-label="Mục lục" className="mt-5 flex flex-wrap gap-2">
            {[
              ["dan-y", "Dàn ý"], ["viet-hay", "Viết cho hay"], ["mo-ket", "Mở bài, kết bài"], ["tu-ngu", "Từ ngữ"],
              ["bai-mau", "Bài tham khảo"], ["loi", "Lỗi hay mắc"], ["tu-kiem-tra", "Tự kiểm tra"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:text-primary-700 hover:ring-primary-200">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
        {prompts.length > 0 && (
          <Card title="Đề thường gặp" icon={<FileQuestion className="h-4 w-4" />}>
            <ul className="space-y-2">
              {prompts.map((p) => (
                <li key={p} className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-700">{p}</li>
              ))}
            </ul>
          </Card>
        )}

        <Card id="dan-y" title={g.form === "doan-van" ? "Dàn ý đoạn văn" : "Dàn ý bài văn"} icon={<ListTree className="h-4 w-4" />}>
          <ol className="space-y-4">
            {g.outline.map((o, i) => (
              <li key={o.part}>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-extrabold ring-1 ${PART_COLORS[i % 3]}`}>{o.part}</span>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700 marker:text-slate-400">
                  {o.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </li>
            ))}
          </ol>
        </Card>

        <Card id="viet-hay" title="Viết sao cho hay?" icon={<Lightbulb className="h-4 w-4" />}>
          <ul className="space-y-4">
            {g.tips.map((t) => (
              <li key={t.title}>
                <p className="font-bold text-slate-900">{t.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{t.text}</p>
                {t.example && <Example>{t.example}</Example>}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-500">
            Thêm mẹo chung cho mọi dạng bài ở <Link href="/lam-van/lop-5#meo" className="font-semibold text-primary-700 hover:underline">trang hướng dẫn làm văn</Link>.
          </p>
        </Card>

        <Card id="mo-ket" title={g.form === "doan-van" ? "Câu mở đoạn, câu kết đoạn mẫu" : "Mở bài, kết bài mẫu"} icon={<MessageSquareQuote className="h-4 w-4" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            {[...g.openings, ...g.endings].map((x, i) => (
              <figure key={i} className="rounded-xl border border-slate-200 p-3">
                <figcaption className="mb-1 text-xs font-extrabold uppercase tracking-wide text-violet-600">{x.label}</figcaption>
                <p className="text-sm leading-relaxed text-slate-700">{x.text}</p>
              </figure>
            ))}
          </div>
        </Card>

        <Card id="tu-ngu" title="Kho từ ngữ gợi ý" icon={<Palette className="h-4 w-4" />}>
          <div className="space-y-3">
            {g.words.map((w) => (
              <div key={w.label}>
                <p className="mb-1.5 text-sm font-bold text-slate-700">{w.label}</p>
                <p className="flex flex-wrap gap-1.5">
                  {w.items.map((it) => (
                    <span key={it} className="rounded-full bg-violet-50 px-2.5 py-1 text-sm text-violet-800 ring-1 ring-violet-100">{it}</span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card id="bai-mau" title="Bài tham khảo" icon={<BookOpen className="h-4 w-4" />}>
          <p className="text-sm text-slate-600">
            <b>Đề:</b> {g.sample.prompt}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Em hãy thử lập dàn ý và viết trước, rồi mới mở bài tham khảo. Đừng học thuộc — mỗi bạn có người thân, ngôi trường, cảm xúc riêng, thầy cô thích nhất bài viết bằng lời của chính em.
          </p>
          <details className="group mt-3 rounded-xl border border-slate-200">
            <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-extrabold text-primary-700">
              <span className="group-open:hidden">Mở bài tham khảo</span>
              <span className="hidden group-open:inline">Thu gọn</span>
            </summary>
            <div className="space-y-3 border-t border-slate-100 px-4 py-4 text-[15px] leading-relaxed text-slate-800">
              {g.sample.paragraphs.map((p, i) => <p key={i} className="indent-6">{p}</p>)}
            </div>
            <p className="mx-4 mb-4 rounded-xl bg-success-50 px-3 py-2 text-sm leading-relaxed text-success-800">
              <b>Vì sao bài này được điểm cao?</b> {g.sample.note}
            </p>
          </details>
        </Card>

        <Card id="loi" title="Lỗi hay mắc" icon={<AlertTriangle className="h-4 w-4" />}>
          <ul className="space-y-2">
            {g.mistakes.map((m) => (
              <li key={m} className="rounded-xl border-l-4 border-coral-300 bg-coral-50 px-3 py-2 text-sm leading-relaxed text-slate-700">{m}</li>
            ))}
          </ul>
        </Card>

        <Card id="tu-kiem-tra" title="Viết xong, tự kiểm tra bài" icon={<ClipboardCheck className="h-4 w-4" />}>
          <SelfCheck items={[FORM_CHECK[g.form], ...g.check, ...CHECKLIST]} />
        </Card>

        <section aria-label="Dạng bài khác">
          <p className="mb-2 text-sm font-bold text-slate-500">Dạng bài khác</p>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => (
              <Link key={o.id} href={`/lam-van/lop-5/${o.id}`} className="inline-flex min-h-10 items-center rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-violet-300 hover:text-violet-700">
                {o.name}
              </Link>
            ))}
          </div>
        </section>

        <QuickExamCta />
      </div>
    </div>
  );
}
