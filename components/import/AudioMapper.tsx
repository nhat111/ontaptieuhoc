"use client";
import { useState } from "react";
import type { Question } from "@/lib/quizData";
import { cloudSegments } from "@/lib/cloudSpeech";

// Gắn file giọng đọc sinh sẵn (Piper…) cho từng câu hỏi.
//
// Vì sao tách khỏi trình soạn đề: gắn audio là việc hàng loạt, làm một lượt cho
// cả bài, và KHÔNG nên đi qua luồng lưu của trình soạn (route đó xoá sạch rồi
// chèn lại toàn bộ câu hỏi).

type Props = {
  lessonId: number;
  lessonTitle: string;
  questions: Question[];
};

/** Tên file gợi ý cho câu thứ i — đánh số 2 chữ số để sắp xếp đúng thứ tự. */
function fileNameFor(index: number): string {
  return `cau-${String(index + 1).padStart(2, "0")}.wav`;
}

export default function AudioMapper({ lessonId, lessonTitle, questions }: Props) {
  const segments = cloudSegments(
    questions.map((q) => ({ question: q.question, options: q.options }))
  );

  const [urls, setUrls] = useState<(string | null)[]>(
    () => questions.map((q) => q.audioUrl ?? null)
  );
  const [busy, setBusy] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const done = urls.filter(Boolean).length;

  /**
   * File đầu vào cho Piper ở chế độ hàng loạt: mỗi dòng một JSON gồm nội dung
   * cần đọc và tên file ra. Một lệnh sinh hết cả bài, khỏi gõ từng câu.
   */
  function downloadJsonl() {
    const lines = segments.map((seg, i) =>
      JSON.stringify({ text: seg.text, output_file: fileNameFor(i) })
    );
    const blob = new Blob([lines.join("\n") + "\n"], { type: "application/jsonl" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `de-${lessonId}-piper.jsonl`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  async function upload(index: number, file: File) {
    setErr(null);
    setMsg(null);
    setBusy(index);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-audio", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok || typeof data?.url !== "string") {
        throw new Error(data?.error ?? `Lỗi ${res.status}`);
      }
      setUrls((prev) => {
        const next = [...prev];
        next[index] = data.url;
        return next;
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Tải file thất bại.");
    } finally {
      setBusy(null);
    }
  }

  /**
   * Chọn nhiều file một lượt: ghép theo CON SỐ trong tên file ("cau-03.wav" →
   * câu 3). Dựa vào số thay vì thứ tự chọn, vì trình duyệt không đảm bảo thứ tự
   * và người dùng dễ chọn lộn xộn.
   */
  async function uploadMany(files: FileList) {
    setErr(null);
    setMsg(null);
    const list = Array.from(files);
    const unmatched: string[] = [];

    for (const file of list) {
      const n = Number(/(\d+)/.exec(file.name)?.[1]);
      const index = Number.isInteger(n) ? n - 1 : -1;
      if (index < 0 || index >= questions.length) {
        unmatched.push(file.name);
        continue;
      }
      await upload(index, file);
    }

    if (unmatched.length) {
      setErr(
        `Không đoán được số câu từ tên file: ${unmatched.join(", ")}. ` +
          `Đặt tên có số thứ tự (cau-01.wav, cau-02.wav…) rồi thử lại.`
      );
    }
  }

  async function save() {
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/lesson-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          items: questions.map((q, i) => ({ questionId: q.id, url: urls[i] })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? `Lỗi ${res.status}`);
      setMsg(`Đã lưu ${data?.updated ?? 0} câu. Vào trang làm bài bấm Nghe là chạy ngay.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="text-sm font-bold text-gray-700">Bước 1 — Tải văn bản cần đọc</h2>
        <p className="mt-1 text-xs text-gray-500">
          File này chứa đúng nội dung sẽ đọc cho từng câu, kèm tên file đầu ra. Chạy Piper
          một lệnh là ra hết cả bài.
        </p>
        <button
          onClick={downloadJsonl}
          className="mt-3 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700"
        >
          Tải file cho Piper (.jsonl)
        </button>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-gray-900 p-3 text-[11px] leading-relaxed text-gray-100">
{`piper -m en_US-lessac-medium.onnx \\
      --json-input --output_dir . \\
      < de-${lessonId}-piper.jsonl`}
        </pre>
        <p className="mt-2 text-[11px] text-gray-400">
          Lệnh trên tạo ra {questions.length} file: {fileNameFor(0)} … {fileNameFor(questions.length - 1)}.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="text-sm font-bold text-gray-700">Bước 2 — Tải file lên</h2>
        <p className="mt-1 text-xs text-gray-500">
          Chọn cả {questions.length} file một lượt cũng được — máy ghép theo số trong tên file.
        </p>
        <input
          type="file"
          accept="audio/*,.wav,.mp3,.ogg,.m4a"
          multiple
          onChange={(e) => e.target.files && uploadMany(e.target.files)}
          className="mt-3 block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700"
        />
      </div>

      {err && (
        <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{err}</p>
      )}
      {msg && (
        <p className="rounded-xl bg-green-50 p-3 text-xs text-green-700">{msg}</p>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-bold text-gray-700">{lessonTitle}</h2>
          <span className="text-xs text-gray-500">{done}/{questions.length} câu có giọng</span>
        </div>
        <ul className="divide-y divide-gray-100">
          {questions.map((q, i) => (
            <li key={q.id} className="p-4">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-xs font-bold text-gray-400">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-700">{q.question}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-gray-400">{fileNameFor(i)}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {urls[i] ? (
                      <>
                        <audio controls src={urls[i]!} className="h-8 max-w-[15rem]" />
                        <button
                          onClick={() =>
                            setUrls((prev) => {
                              const next = [...prev];
                              next[i] = null;
                              return next;
                            })
                          }
                          className="text-[11px] text-red-500 hover:underline"
                        >
                          Gỡ
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600">
                        {busy === i ? "Đang tải…" : "Chọn file"}
                        <input
                          type="file"
                          accept="audio/*,.wav,.mp3,.ogg,.m4a"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) upload(i, f);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Đang lưu…" : "Lưu giọng đọc"}
      </button>
      <p className="text-center text-[11px] text-gray-400">
        Tải file lên chưa có tác dụng cho tới khi bấm Lưu.
      </p>
    </div>
  );
}
