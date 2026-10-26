"use client";

import { Download, Printer, RefreshCw } from "lucide-react";
import { useState } from "react";
import { track } from "@/lib/usage";
import { buildWordDoc } from "@/lib/wordDoc";
import {
  MATH_RANGES, buildDailySheets, buildDailySheetHtml, mathBlocksFor, spellGroupsFor, spellLabel,
  type DailyGrade, type DailySubject, type MathRange,
} from "@/lib/dailySheet";

const COUNTS = [1, 5, 10];
const DEFAULT_MATH: Record<DailyGrade, string[]> = {
  1: ["bond", "compare", "calc", "order"],
  2: ["qua10", "conho", "nhanchia", "sosanh1000"],
};
const DEFAULT_SPELL: Record<DailyGrade, string[]> = {
  1: ["c-k", "l-n", "ch-tr", "s-x"],
  2: ["r-d-gi", "ao-au", "ai-ay", "an-ang"],
};
const newSeed = () => Math.random().toString(36).slice(2, 8);

export default function DailySheetClient() {
  const [grade, setGrade] = useState<DailyGrade>(1);
  const [subject, setSubject] = useState<DailySubject>("toan");
  const [range, setRange] = useState<MathRange>(10);
  const [mathIds, setMathIds] = useState<string[]>(DEFAULT_MATH[1]);
  const [spellIds, setSpellIds] = useState<string[]>(DEFAULT_SPELL[1]);
  const [count, setCount] = useState(1);
  const [withAnswers, setWithAnswers] = useState(true);
  const [decor, setDecor] = useState(true);
  // Chỉ sinh sau khi bấm (sinh lúc render sẽ lệch giữa server và trình duyệt).
  const [seed, setSeed] = useState<string | null>(null);

  const available = subject === "toan"
    ? mathBlocksFor(range, grade).map((b) => ({ id: b.id, label: b.label }))
    : spellGroupsFor(grade).map((g) => ({ id: g.id, label: `Điền ${g.part === "van" ? "vần " : ""}${spellLabel(g)}` }));
  const chosen = (subject === "toan" ? mathIds : spellIds).filter((id) => available.some((a) => a.id === id));

  // Sinh rất nhanh (vài trăm số) nên tính lại mỗi lần render, khỏi cần useMemo.
  const sheets = seed && chosen.length ? buildDailySheets({ grade, subject, range, blockIds: chosen, count, seed }) : [];

  const title = `Phiếu luyện ${subject === "toan" ? "Toán" : "Tiếng Việt"} lớp ${grade}`;

  function pickGrade(g: DailyGrade) {
    setGrade(g);
    setMathIds(DEFAULT_MATH[g]);
    setSpellIds(DEFAULT_SPELL[g]);
  }

  function html(autoPrint: boolean, answers = withAnswers) {
    const footer = typeof window !== "undefined" ? `Phiếu tạo miễn phí tại ${window.location.host}` : undefined;
    return buildDailySheetHtml(sheets, { title, withAnswers: answers, autoPrint, footer, decor });
  }

  function toggle(id: string) {
    const set = subject === "toan" ? setMathIds : setSpellIds;
    set((cur) => (cur.includes(id) ? (cur.length > 1 ? cur.filter((x) => x !== id) : cur) : [...cur, id]));
  }

  async function downloadDoc() {
    track("daily_word", { grade, detail: subject });
    // Hình trang trí là SVG — Word chỉ hiện khi đã vẽ lại thành PNG và nhúng vào file.
    const blob = await buildWordDoc(html(false));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject === "toan" ? "phieu-toan" : "phieu-tieng-viet"}-lop-${grade}-${seed}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openPdf() {
    track("daily_print", { grade, detail: subject });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html(true));
    w.document.close();
  }

  const chip = (active: boolean) =>
    `min-h-10 rounded-xl border-2 px-4 py-1.5 text-sm font-bold transition-colors ${
      active ? "border-primary-500 bg-primary-50 text-primary-700" : "border-slate-200 bg-white text-slate-600 hover:border-primary-200"
    }`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-5 sm:p-7 space-y-5">
        <div>
          <p className="text-sm font-bold text-gray-700 mb-2">Lớp</p>
          <div className="flex flex-wrap gap-2">
            {([1, 2] as const).map((g) => (
              <button key={g} onClick={() => pickGrade(g)} className={chip(g === grade)}>Lớp {g}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-gray-700 mb-2">Môn</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSubject("toan")} className={chip(subject === "toan")}>Toán lớp {grade}</button>
            <button onClick={() => setSubject("tieng-viet")} className={chip(subject === "tieng-viet")}>Tiếng Việt lớp {grade}</button>
          </div>
        </div>

        {subject === "toan" && grade === 1 && (
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Phạm vi số</p>
            <div className="flex flex-wrap gap-2">
              {MATH_RANGES.map((r) => (
                <button key={r.value} onClick={() => setRange(r.value)} className={chip(r.value === range)}>{r.label}</button>
              ))}
            </div>
            {range === 100 && (
              <p className="mt-1 text-xs text-gray-400">Phạm vi 100: cộng, trừ không nhớ; không có sơ đồ tách – gộp.</p>
            )}
          </div>
        )}

        <div>
          <p className="text-sm font-bold text-gray-700 mb-2">
            Các bài trong phiếu <span className="font-normal text-gray-400">(chọn một hoặc nhiều)</span>
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {available.map((b) => {
              const on = chosen.includes(b.id);
              return (
                <label key={b.id} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer ${on ? "border-primary-400 bg-primary-50/60" : "border-gray-200 hover:border-primary-200"}`}>
                  <input type="checkbox" checked={on} onChange={() => toggle(b.id)} className="mt-0.5" />
                  <span className="text-gray-700">{b.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Số phiếu <span className="font-normal text-gray-400">(mỗi phiếu khác nhau)</span></p>
            <div className="flex flex-wrap gap-2">
              {COUNTS.map((c) => <button key={c} onClick={() => setCount(c)} className={chip(c === count)}>{c}</button>)}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:pt-7">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={withAnswers} onChange={(e) => setWithAnswers(e.target.checked)} />
              Kèm đáp án ở các trang cuối
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={decor} onChange={(e) => setDecor(e.target.checked)} />
              Trang trí hình vui nhộn <span className="text-gray-400">(bỏ chọn để tiết kiệm mực)</span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button onClick={() => setSeed(newSeed())}
            className={seed ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary-200 bg-white px-5 text-sm font-bold text-primary-700 hover:bg-primary-50" : "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-b-4 border-primary-800 bg-primary-600 px-6 text-base font-extrabold text-white shadow-pop transition-all hover:bg-primary-700 active:translate-y-0.5 active:border-b-2"}>
            {seed ? <RefreshCw className="h-4 w-4" aria-hidden /> : <Printer className="h-5 w-5" aria-hidden />}
            {seed ? "Đổi bộ khác" : "Tạo phiếu"}
          </button>
          {sheets.length > 0 && (
            <>
              <button onClick={downloadDoc}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary-200 bg-white px-5 text-sm font-bold text-primary-700 hover:bg-primary-50">
                <Download className="h-4 w-4" aria-hidden />
                Tải Word (.doc)
              </button>
              <button onClick={openPdf}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-b-4 border-primary-800 bg-primary-600 px-6 text-base font-extrabold text-white shadow-pop transition-all hover:bg-primary-700 active:translate-y-0.5 active:border-b-2">
                <Printer className="h-4 w-4" aria-hidden />
                In / lưu PDF
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400">
          Mỗi phiếu một trang A4, mỗi lần bấm ra bộ số / bộ từ mới. In 5 phiếu là đủ cho bé luyện cả tuần.
        </p>
      </div>

      {sheets.length > 0 && (
        <div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-soft p-3 sm:p-5">
          <h2 className="px-2 pb-2 font-extrabold text-gray-800">
            Xem trước{count > 1 ? " – phiếu số 1" : ""}
          </h2>
          {/* Phiếu rộng bằng khổ A4: trên điện thoại cuộn ngang thay vì bóp méo bố cục. */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <iframe
              title="Xem trước phiếu"
              srcDoc={buildDailySheetHtml(sheets.slice(0, 1), { title, withAnswers: false, decor })}
              className="block w-full min-w-[700px] h-[1100px] bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
