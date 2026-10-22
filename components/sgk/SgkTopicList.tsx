"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CheckCircle2, ChevronRight, Clock, PencilRuler } from "lucide-react";
import { getProgress, getServerProgress, lessonState, subscribeProgress } from "@/lib/lessonProgress";

// Mục lục một tập sách: mỗi chủ đề một thẻ, mỗi bài một dòng với nút theo tiến độ trên
// máy (như trang lớp): Học ngay / Tiếp tục · N% / Hoàn thành.

export type SgkRow = {
  so: number;
  ten: string;
  href: string;
  progressKey: string;
  /** ready: làm trên máy · soon: đang soạn · paper: thực hành trên giấy */
  status: "ready" | "soon" | "paper";
  luyen: boolean;
};
export type SgkTopicView = { so: number; ten: string; rows: SgkRow[] };

export default function SgkTopicList({ topics, accent }: { topics: SgkTopicView[]; accent: string }) {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);

  return (
    <div className="space-y-4">
      {topics.map((t) => {
        const ready = t.rows.filter((r) => r.status === "ready");
        const done = ready.filter((r) => lessonState(progress[r.progressKey]) === "done").length;
        return (
          <section key={t.so} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black ${accent}`} aria-hidden>
                {t.so}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-extrabold leading-snug text-slate-900">Chủ đề {t.so}. {t.ten}</h3>
                {ready.length > 0 && (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-success-500" style={{ width: `${(done / ready.length) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-slate-500">{done}/{ready.length} bài</span>
                  </div>
                )}
              </div>
            </div>
            <ul className="divide-y divide-slate-100">
              {t.rows.map((r) => {
                const rec = progress[r.progressKey];
                const state = lessonState(rec);
                return (
                  <li key={r.so}>
                    <Link href={r.href} className="group flex min-h-14 items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                      <span className="w-12 flex-shrink-0 text-xs font-bold tabular-nums text-slate-400">Bài {r.so}</span>
                      <span className={`min-w-0 flex-1 text-sm leading-snug ${r.status === "ready" ? "font-semibold text-slate-800" : "text-slate-500"}`}>
                        {r.ten}
                      </span>
                      {r.status === "soon" ? (
                        <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                          <Clock className="h-3 w-3" aria-hidden /> Đang soạn
                        </span>
                      ) : r.status === "paper" ? (
                        <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-star-50 px-2.5 py-1 text-xs font-semibold text-star-700">
                          <PencilRuler className="h-3 w-3" aria-hidden /> Thực hành
                        </span>
                      ) : state === "done" ? (
                        <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-bold text-success-700">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Hoàn thành
                        </span>
                      ) : (
                        <span className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">
                          {state === "doing" ? `Tiếp tục · ${rec!.best}%` : r.luyen ? "Luyện tập" : "Học ngay"}
                          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
