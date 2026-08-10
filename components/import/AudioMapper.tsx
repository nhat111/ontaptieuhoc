"use client";
import { useState } from "react";
import type { Question } from "@/lib/quizData";
import { cloudSegments } from "@/lib/cloudSpeech";
import { questionIndexFromFileName } from "@/lib/audioFileName";

// Gắn file giọng đọc sinh sẵn (Piper, thu âm thật…) cho từng câu hỏi.
//
// Nguyên tắc dẫn đường cho cả màn hình này: ghép sai là lỗi IM LẶNG — bé nghe
// nhầm câu mà không ai biết. Nên mọi chỗ đều hiện rõ file nào đang gắn vào câu
// nào, và mọi file không ghép được đều bị nêu tên chứ không bỏ qua lặng lẽ.

type Props = {
  lessonId: number;
  lessonTitle: string;
  questions: Question[];
};

export default function AudioMapper({ lessonId, lessonTitle, questions }: Props) {
  const [urls, setUrls] = useState<(string | null)[]>(
    () => questions.map((q) => q.audioUrl ?? null)
  );
  // Tên file nguồn của từng câu, chỉ để hiện cho người dùng đối chiếu.
  const [sources, setSources] = useState<(string | null)[]>(
    () => questions.map(() => null)
  );
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);

  const done = urls.filter(Boolean).length;

  async function uploadOne(index: number, file: File): Promise<boolean> {
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
    setSources((prev) => {
      const next = [...prev];
      next[index] = file.name;
      return next;
    });
    return true;
  }

  /**
   * Chọn nhiều file một lượt. Ghép theo SỐ trong tên file, không theo thứ tự
   * chọn — trình duyệt không đảm bảo thứ tự, và người dùng chọn lộn xộn là
   * chuyện thường.
   */
  async function handleFiles(files: FileList) {
    setMsg(null);
    const found: string[] = [];
    const plan = new Map<number, File>();

    for (const file of Array.from(files)) {
      const index = questionIndexFromFileName(file.name);
      if (index === null) {
        found.push(`${file.name}: không thấy số thứ tự trong tên file`);
        continue;
      }
      if (index >= questions.length) {
        found.push(`${file.name}: ứng với câu ${index + 1}, mà đề chỉ có ${questions.length} câu`);
        continue;
      }
      const clash = plan.get(index);
      if (clash) found.push(`${file.name} và ${clash.name} cùng ứng với câu ${index + 1}`);
      plan.set(index, file);
    }

    setBusy(true);
    let ok = 0;
    for (const [index, file] of plan) {
      try {
        await uploadOne(index, file);
        ok++;
      } catch (e) {
        found.push(`${file.name}: ${e instanceof Error ? e.message : "tải lên thất bại"}`);
      }
    }
    setBusy(false);
    setProblems(found);
    if (ok) setMsg(`Đã tải lên ${ok} file. Kiểm tra bảng bên dưới rồi bấm Lưu.`);
  }

  async function save() {
    setSaving(true);
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
      setProblems([]);
    } catch (e) {
      setProblems([e instanceof Error ? e.message : "Lưu thất bại."]);
    } finally {
      setSaving(false);
    }
  }

  /** Văn bản nên đọc cho từng câu — chỉ cần khi người dùng muốn sinh cho khớp. */
  function downloadText() {
    const segments = cloudSegments(
      questions.map((q) => ({ question: q.question, options: q.options }))
    );
    const body = segments
      .map((seg, i) => `--- wav_${i + 1} ---\n${seg.text}\n`)
      .join("\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `de-${lessonId}-van-ban.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <h2 className="text-sm font-bold text-gray-700">Tải file lên</h2>
        <p className="mt-1 text-xs text-gray-500">
          Đặt tên file có số thứ tự câu: <code>wav_1.wav</code>, <code>wav_2.wav</code>…
          Chọn cả {questions.length} file một lượt cũng được, máy ghép theo số trong tên
          chứ không theo thứ tự chọn.
        </p>
        <input
          type="file"
          accept="audio/*,.wav,.mp3,.ogg,.m4a"
          multiple
          disabled={busy}
          onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
          className="mt-3 block w-full text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700 disabled:opacity-50"
        />
        {busy && <p className="mt-2 text-xs text-blue-600">Đang tải lên…</p>}
      </div>

      {problems.length > 0 && (
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          <b>Có {problems.length} file cần xem lại:</b>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {problems.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
      {msg && <p className="rounded-xl bg-green-50 p-3 text-xs text-green-700">{msg}</p>}

      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="truncate text-sm font-bold text-gray-700">{lessonTitle}</h2>
          <span className="flex-shrink-0 text-xs text-gray-500">
            {done}/{questions.length} câu có giọng
          </span>
        </div>
        <ul className="divide-y divide-gray-100">
          {questions.map((q, i) => (
            <li key={q.id} className="p-4">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 text-xs font-bold text-gray-400">
                  Câu {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-700">{q.question}</p>

                  {sources[i] && (
                    <p className="mt-0.5 font-mono text-[11px] text-green-700">
                      ← {sources[i]}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {urls[i] ? (
                      <>
                        {/* Nghe thử tại chỗ: cách duy nhất chắc chắn phát hiện ghép lệch câu. */}
                        <audio controls preload="none" src={urls[i]!} className="h-8 max-w-[14rem]" />
                        <button
                          onClick={() => {
                            setUrls((prev) => { const n = [...prev]; n[i] = null; return n; });
                            setSources((prev) => { const n = [...prev]; n[i] = null; return n; });
                          }}
                          className="text-[11px] text-red-500 hover:underline"
                        >
                          Gỡ
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600">
                        Chọn file cho câu này
                        <input
                          type="file"
                          accept="audio/*,.wav,.mp3,.ogg,.m4a"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setBusy(true);
                            try {
                              await uploadOne(i, f);
                              setMsg(null);
                            } catch (err) {
                              setProblems([err instanceof Error ? err.message : "Tải lên thất bại."]);
                            } finally {
                              setBusy(false);
                            }
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
        disabled={saving || busy}
        className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Đang lưu…" : "Lưu giọng đọc"}
      </button>
      <p className="text-center text-[11px] text-gray-400">
        Nghe thử từng câu ở trên trước khi lưu — đó là cách chắc chắn nhất phát hiện file
        gắn nhầm câu. Tải lên chưa có tác dụng cho tới khi bấm Lưu.
      </p>

      <details className="rounded-2xl border border-gray-100 bg-white p-4">
        <summary className="cursor-pointer text-xs font-semibold text-gray-600">
          Cần văn bản để đọc cho khớp từng câu?
        </summary>
        <p className="mt-2 text-xs text-gray-500">
          Tải file text liệt kê nội dung nên đọc của từng câu, kèm tên file tương ứng.
          Chỉ cần khi bro muốn nội dung audio khớp đúng với những gì hiện trên màn hình.
        </p>
        <button
          onClick={downloadText}
          className="mt-2 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600"
        >
          Tải văn bản (.txt)
        </button>
      </details>
    </div>
  );
}
