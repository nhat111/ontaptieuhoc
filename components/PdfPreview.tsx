"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, Printer, X } from "lucide-react";
import Spinner from "@/components/Spinner";
import { htmlToPdf, type PdfResult } from "@/lib/htmlToPdf";

interface Props {
  /** Tài liệu HTML in được (buildExamHtml / buildPaperHtml, không autoPrint). */
  html: string;
  /** Tên file tải về, không kèm đuôi. */
  fileName: string;
  title: string;
  /** Mở hộp thoại in của trình duyệt (cách cũ) — phải gọi ngay trong cú bấm. */
  onPrint: () => void;
  onClose: () => void;
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Thu hồi muộn: Safari còn đọc blob sau khi click() trả về.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// Bấm "PDF" → tạo file PDF ngay trên máy, tự tải về, và hiện từng trang để
// xem luôn tại chỗ. Xem trước bằng ảnh trang chứ không nhúng PDF vào iframe:
// Android không hiện PDF trong trang, iOS chỉ hiện trang đầu.
export default function PdfPreview({ html, fileName, title, onPrint, onClose }: Props) {
  const [result, setResult] = useState<PdfResult | null>(null);
  const [error, setError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    htmlToPdf(html)
      .then((r) => {
        if (!alive) return;
        setResult(r);
        setBlobUrl(URL.createObjectURL(r.blob));
        save(r.blob, fileName);
      })
      .catch((e) => {
        console.error("[pdf]", e);
        if (alive) setError(true);
      });
    return () => { alive = false; };
  }, [html, fileName]);

  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const btn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-bold transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/70" role="dialog" aria-modal="true" aria-label={`Xem PDF: ${title}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-5">
        <p className="mr-auto min-w-0 flex-1 truncate text-sm font-extrabold text-slate-800">
          {title}
          {result && <span className="ml-2 font-semibold text-slate-400">{result.pages.length} trang</span>}
        </p>
        <button
          onClick={() => result && save(result.blob, fileName)}
          disabled={!result}
          className={`${btn} bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50`}
        >
          <Download className="h-4 w-4" aria-hidden />
          Tải file PDF
        </button>
        {blobUrl && (
          <a href={blobUrl} target="_blank" rel="noopener" className={`${btn} border-2 border-slate-200 text-slate-700 hover:bg-slate-50`}>
            <ExternalLink className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Mở PDF</span>
          </a>
        )}
        <button onClick={onPrint} className={`${btn} border-2 border-slate-200 text-slate-700 hover:bg-slate-50`}>
          <Printer className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">In</span>
        </button>
        <button onClick={onClose} aria-label="Đóng" className={`${btn} px-2.5 text-slate-500 hover:bg-slate-100`}>
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        {error ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-6 text-center text-sm text-slate-600">
            <p className="font-bold text-coral-600">Không tạo được file PDF trên máy này.</p>
            <p className="mt-2">Bấm <b>In</b> ở trên rồi chọn “Lưu thành PDF” trong hộp thoại in.</p>
          </div>
        ) : !result ? (
          <div className="mx-auto mt-16 w-fit rounded-2xl bg-white px-8 py-6">
            <Spinner label="Đang tạo file PDF…" />
          </div>
        ) : (
          <div className="mx-auto max-w-[794px] space-y-4">
            <p className="text-center text-xs font-semibold text-white/80">
              File PDF đã được tải về máy. Không thấy file? Bấm “Tải file PDF”.
            </p>
            {result.pages.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={`Trang ${i + 1}`} className="block w-full rounded bg-white shadow-pop" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
