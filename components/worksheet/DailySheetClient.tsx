"use client";

import { useState } from "react";
import {
  MATH_RANGES, SPELL_GROUPS, buildDailySheets, buildDailySheetHtml, mathBlocksFor, spellLabel,
  type DailySubject, type MathRange,
} from "@/lib/dailySheet";

const COUNTS = [1, 5, 10];
const DEFAULT_MATH = ["bond", "compare", "calc", "order"];
const DEFAULT_SPELL = ["c-k", "l-n", "ch-tr", "s-x"];
const newSeed = () => Math.random().toString(36).slice(2, 8);

export default function DailySheetClient() {
  const [subject, setSubject] = useState<DailySubject>("toan");
  const [range, setRange] = useState<MathRange>(10);
  const [mathIds, setMathIds] = useState<string[]>(DEFAULT_MATH);
  const [spellIds, setSpellIds] = useState<string[]>(DEFAULT_SPELL);
  const [count, setCount] = useState(1);
  const [withAnswers, setWithAnswers] = useState(true);
  // Chỉ sinh sau khi bấm (sinh lúc render sẽ lệch giữa server và trình duyệt).
  const [seed, setSeed] = useState<string | null>(null);

  const available = subject === "toan"
    ? mathBlocksFor(range).map((b) => ({ id: b.id, label: b.label }))
    : SPELL_GROUPS.map((g) => ({ id: g.id, label: `Điền ${spellLabel(g)}` }));
  const chosen = (subject === "toan" ? mathIds : spellIds).filter((id) => available.some((a) => a.id === id));

  // Sinh rất nhanh (vài trăm số) nên tính lại mỗi lần render, khỏi cần useMemo.
  const sheets = seed && chosen.length ? buildDailySheets({ subject, range, blockIds: chosen, count, seed }) : [];

  const title = subject === "toan" ? "Phiếu luyện Toán lớp 1" : "Phiếu luyện Tiếng Việt lớp 1";

  function html(autoPrint: boolean, answers = withAnswers) {
    const footer = typeof window !== "undefined" ? `Phiếu tạo miễn phí tại ${window.location.host}` : undefined;
    return buildDailySheetHtml(sheets, { title, withAnswers: answers, autoPrint, footer });
  }

  function toggle(id: string) {
    const set = subject === "toan" ? setMathIds : setSpellIds;
    set((cur) => (cur.includes(id) ? (cur.length > 1 ? cur.filter((x) => x !== id) : cur) : [...cur, id]));
  }

  function downloadDoc() {
    const blob = new Blob([html(false)], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${subject === "toan" ? "phieu-toan" : "phieu-tieng-viet"}-lop-1-${seed}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function openPdf() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html(true));
    w.document.close();
  }

  const chip = (active: boolean) =>
    `rounded-xl border px-3 py-1.5 text-sm font-semibold transition-colors ${
      active ? "bg-rose-500 border-transparent text-white" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-7 space-y-5">
        <div>
          <p className="text-sm font-bold text-gray-700 mb-2">Môn</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSubject("toan")} className={chip(subject === "toan")}>Toán lớp 1</button>
            <button onClick={() => setSubject("tieng-viet")} className={chip(subject === "tieng-viet")}>Tiếng Việt lớp 1</button>
          </div>
        </div>

        {subject === "toan" && (
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
                <label key={b.id} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer ${on ? "bg-rose-50 border-rose-200" : "border-gray-200 hover:bg-gray-50"}`}>
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
          <label className="flex items-center gap-2 text-sm text-gray-700 sm:pt-7">
            <input type="checkbox" checked={withAnswers} onChange={(e) => setWithAnswers(e.target.checked)} />
            Kèm đáp án ở các trang cuối
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button onClick={() => setSeed(newSeed())}
            className="rounded-2xl bg-yellow-400 px-5 py-2.5 text-sm font-bold text-gray-900 shadow hover:bg-yellow-300">
            {seed ? "🔄 Đổi bộ khác" : "Tạo phiếu"}
          </button>
          {sheets.length > 0 && (
            <>
              <button onClick={downloadDoc}
                className="rounded-2xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                Tải Word (.doc)
              </button>
              <button onClick={openPdf}
                className="rounded-2xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50">
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
        <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm p-3 sm:p-5">
          <h2 className="px-2 pb-2 font-extrabold text-gray-800">
            Xem trước{count > 1 ? " – phiếu số 1" : ""}
          </h2>
          {/* Phiếu rộng bằng khổ A4: trên điện thoại cuộn ngang thay vì bóp méo bố cục. */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <iframe
              title="Xem trước phiếu"
              srcDoc={buildDailySheetHtml(sheets.slice(0, 1), { title, withAnswers: false })}
              className="block w-full min-w-[700px] h-[1100px] bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
