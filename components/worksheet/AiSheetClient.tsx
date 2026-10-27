"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { AI_GRADES, aiGrade, buildAiSheetHtml } from "@/lib/aiSheets";
import { track } from "@/lib/usage";
import PdfPreview from "@/components/PdfPreview";

const ALL_GRADES = [1, 2, 3, 4, 5];

export default function AiSheetClient() {
  const [grade, setGrade] = useState(AI_GRADES[0].grade);
  const data = aiGrade(grade)!;
  const [picked, setPicked] = useState<number[]>(data.sheets.map((s) => s.no));
  const [withTeacher, setWithTeacher] = useState(true);
  const [previewNo, setPreviewNo] = useState(1);
  const [pdfHtml, setPdfHtml] = useState<string | null>(null);

  const sheets = data.sheets.filter((s) => picked.includes(s.no));
  const allOn = picked.length === data.sheets.length;
  const preview = data.sheets.find((s) => s.no === previewNo) ?? data.sheets[0];

  function toggle(no: number) {
    setPicked((cur) => (cur.includes(no) ? cur.filter((x) => x !== no) : [...cur, no].sort((a, b) => a - b)));
  }

  const sheetHtml = (autoPrint: boolean) =>
    buildAiSheetHtml(grade, sheets, { withTeacher, autoPrint, footer: `Phiếu miễn phí tại ${window.location.host}` });

  // Dựng PDF ngay trên máy rồi tải về: hộp thoại in của điện thoại không lưu ra được file PDF.
  function openPdf() {
    track("ai_sheet_print", { grade, detail: `${sheets.length} phiếu` });
    setPdfHtml(sheetHtml(false));
  }

  function printSheet() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(sheetHtml(true));
    w.document.close();
  }

  const chip = (active: boolean, disabled = false) =>
    `min-h-10 rounded-xl border-2 px-4 py-1.5 text-sm font-bold transition-colors ${
      disabled ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
        : active ? "border-primary-500 bg-primary-50 text-primary-700" : "border-slate-200 bg-white text-slate-600 hover:border-primary-200"
    }`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-5 sm:p-7 space-y-5">
        <p className="text-sm text-gray-600">
          Phiếu cho <b>12 tiết AI cốt lõi</b> theo Quyết định 2422/QĐ-BGDĐT. Mỗi phiếu một tiết, làm trên giấy,
          không cần máy tính; trang dành cho thầy cô có mục tiêu, tiến trình 35 phút và đáp án.
        </p>

        <div>
          <p className="text-sm font-bold text-gray-700 mb-2">Lớp</p>
          <div className="flex flex-wrap gap-2">
            {ALL_GRADES.map((g) => {
              const ready = !!aiGrade(g);
              return (
                <button key={g} disabled={!ready} onClick={() => { setGrade(g); setPicked(aiGrade(g)!.sheets.map((s) => s.no)); setPreviewNo(1); }}
                  className={chip(g === grade, !ready)} title={ready ? undefined : "Đang soạn"}>
                  Lớp {g}{ready ? "" : " · đang soạn"}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">Chọn tiết</p>
            <button onClick={() => setPicked(allOn ? [] : data.sheets.map((s) => s.no))} className="text-xs font-semibold text-indigo-600 hover:underline">
              {allOn ? "Bỏ chọn tất cả" : "Chọn cả 12 tiết"}
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {data.sheets.map((s) => {
              const on = picked.includes(s.no);
              return (
                <label key={s.no} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer ${on ? "bg-indigo-50 border-indigo-200" : "border-gray-200 hover:bg-gray-50"}`}>
                  <input type="checkbox" checked={on} onChange={() => toggle(s.no)} className="mt-0.5" />
                  <span className="text-gray-700">
                    <b>Tiết {s.no}.</b> {s.title}
                    <span className="block text-[11px] text-gray-400">{s.codes.length > 3 ? "Ôn tập cả năm" : s.codes.join(", ")}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={withTeacher} onChange={(e) => setWithTeacher(e.target.checked)} />
          Kèm trang dành cho thầy cô (mục tiêu, tiến trình, đáp án) sau mỗi phiếu
        </label>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button onClick={openPdf} disabled={sheets.length === 0}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-b-4 border-primary-800 bg-primary-600 px-6 text-base font-extrabold text-white shadow-pop transition-all hover:bg-primary-700 active:translate-y-0.5 active:border-b-2 disabled:pointer-events-none disabled:opacity-40">
            <Printer className="h-5 w-5" aria-hidden />
            Xem & tải PDF {sheets.length > 0 ? `(${sheets.length} phiếu)` : ""}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Thầy cô cần bản Word để tự chỉnh sửa? <Link href="/gop-y" className="text-indigo-600 hover:underline">Nhắn cho chúng tôi</Link>.
        </p>
      </div>

      <div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-soft p-3 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 px-2 pb-3">
          <h2 className="font-extrabold text-gray-800 mr-2">Xem trước</h2>
          <select value={previewNo} onChange={(e) => setPreviewNo(Number(e.target.value))}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
            {data.sheets.map((s) => <option key={s.no} value={s.no}>Tiết {s.no}. {s.title}</option>)}
          </select>
        </div>
        {/* Phiếu rộng bằng khổ A4: trên điện thoại cuộn ngang thay vì bóp méo bố cục. */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <iframe
            title="Xem trước phiếu"
            srcDoc={buildAiSheetHtml(grade, [preview], { withTeacher })}
            className="block w-full min-w-[700px] h-[1150px] bg-white"
          />
        </div>
      </div>
      {pdfHtml && (
        <PdfPreview
          html={pdfHtml}
          fileName={`phieu-ai-lop-${grade}`}
          title={`Phiếu hoạt động AI lớp ${grade}`}
          onPrint={printSheet}
          onClose={() => setPdfHtml(null)}
        />
      )}
    </div>
  );
}
