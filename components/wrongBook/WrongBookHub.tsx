"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookX, CheckCircle2, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import MathText from "@/components/MathText";
import { displayAnswer } from "@/lib/quizData";
import { MASTER_AFTER, practiceHref, removeEntry, saveBook, getBook, type WrongEntry } from "@/lib/wrongBook";
import { useMounted, useWrongBook } from "./hooks";

const newSeed = () => Math.random().toString(36).slice(2, 8);

export default function WrongBookHub() {
  const mounted = useMounted();
  const book = useWrongBook();
  const router = useRouter();

  if (!mounted) return <div className="h-72 animate-pulse rounded-3xl bg-white/60" aria-hidden />;

  const { entries, mastered } = book;
  if (!entries.length) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-10 text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500" aria-hidden>
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <p className="text-lg font-extrabold text-slate-800">Sổ đang trống!</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
          {mastered ? `Con đã gạch được ${mastered} câu / dạng bài khỏi sổ. Giỏi quá!` : "Câu nào con làm sai sẽ tự được ghi vào đây để ôn lại."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/nhiem-vu" className="inline-flex min-h-11 items-center rounded-xl border-b-4 border-primary-800 bg-primary-600 px-5 text-sm font-extrabold text-white hover:bg-primary-700">Làm nhiệm vụ hôm nay</Link>
          <Link href="/#grades" className="inline-flex min-h-11 items-center rounded-xl border-2 border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:border-slate-300">Chọn lớp</Link>
        </div>
      </div>
    );
  }

  const remove = (key: string) => saveBook(removeEntry(getBook(), key));

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:p-6">
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-coral-50 text-coral-600" aria-hidden>
          <BookX className="h-7 w-7" />
        </span>
        <div className="flex-1">
          <p className="text-xl font-black text-slate-900"><span className="tabular-nums">{entries.length}</span> mục cần ôn</p>
          <p className="text-sm text-slate-500">
            Làm đúng {MASTER_AFTER} lần liền là được gạch khỏi sổ.{mastered ? <> Đã gạch <b className="tabular-nums">{mastered}</b>.</> : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(practiceHref(entries, newSeed()))}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-b-4 border-primary-800 bg-primary-600 px-6 text-base font-extrabold text-white shadow-pop hover:bg-primary-700 active:translate-y-0.5 active:border-b-2"
        >
          <Sparkles className="h-5 w-5" aria-hidden /> Ôn 10 câu
        </button>
      </section>

      <ul className="space-y-3">
        {entries.map((e) => <EntryCard key={e.key} e={e} onRemove={() => remove(e.key)} onSimilar={() => router.push(practiceHref([e], newSeed()))} />)}
      </ul>
    </div>
  );
}

function EntryCard({ e, onRemove, onSimilar }: { e: WrongEntry; onRemove: () => void; onSimilar: () => void }) {
  const img = e.q.images?.[0]?.url ?? e.q.imageUrl;
  const meta = [e.subject, e.grade ? `Lớp ${e.grade}` : null].filter(Boolean).join(" ");
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{meta || "Bài làm"}{e.src ? " · Dạng bài" : ""}</p>
          <p className="font-extrabold text-slate-800">{e.title}</p>
        </div>
        <span className="rounded-full bg-coral-50 px-2.5 py-1 text-xs font-bold text-coral-700">
          Sai {e.wrong} lần · đúng liền {e.streak}/{MASTER_AFTER}
        </span>
      </div>
      <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
        <p className="mb-1 text-xs font-semibold text-slate-400">{e.src ? "Câu con làm sai gần nhất" : "Câu con làm sai"}</p>
        {/* eslint-disable-next-line @next/next/no-img-element -- hình câu hỏi (SVG tự vẽ hoặc ảnh đã tải lên) */}
        {img && <img src={img} alt="" className="mb-2 max-h-32 w-auto" />}
        <p className="whitespace-pre-wrap"><MathText text={e.q.question} /></p>
        <details className="mt-1.5">
          <summary className="cursor-pointer text-xs font-semibold text-primary-700">Xem đáp án</summary>
          <p className="mt-1 text-sm font-semibold text-emerald-700"><MathText text={displayAnswer(e.q)} /></p>
          {e.q.explanation && <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600"><MathText text={e.q.explanation} /></p>}
        </details>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {e.src && (
          <button type="button" onClick={onSimilar} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-primary-600 px-4 text-sm font-bold text-white hover:bg-primary-700">
            <RefreshCw className="h-4 w-4" aria-hidden /> Làm câu tương tự
          </button>
        )}
        <button type="button" onClick={onRemove} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-slate-300">
          <Trash2 className="h-4 w-4" aria-hidden /> Xoá khỏi sổ
        </button>
      </div>
    </li>
  );
}
