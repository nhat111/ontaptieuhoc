"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadRecordedClips } from "@/lib/recordedClips";
import { toCleanWav } from "@/lib/wavEncode";

export type VoiceGroup = { id: string; title: string; tip: string; texts: string[] };

interface Props {
  groups: VoiceGroup[];
  /** Câu → file Piper hiện đang dùng, để nghe so sánh. */
  piper: Record<string, string>;
}

type Phase = "idle" | "recording" | "processing" | "review" | "saving";

const MAX_SECONDS = 8;

/**
 * Thu giọng thật cho các câu trò chơi lớp 1, từng câu một:
 * chọn câu → Thu → Dừng → nghe lại → Lưu (tự sang câu chưa thu kế tiếp).
 *
 * Bản thu được làm sạch ngay trên máy (cắt lặng, chỉnh âm lượng, đổi WAV —
 * xem lib/wavEncode.ts) rồi mới tải lên, nên người thu không cần biết gì về
 * âm thanh.
 */
export default function GameVoiceRecorder({ groups, piper }: Props) {
  const order = useMemo(() => groups.flatMap((g) => g.texts), [groups]);
  const groupOf = useMemo(
    () => new Map(groups.flatMap((g) => g.texts.map((t) => [t, g] as const))),
    [groups]
  );

  const [recorded, setRecorded] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [current, setCurrent] = useState(order[0]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [take, setTake] = useState<{ url: string; wav: Blob; seconds: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let alive = true;
    loadRecordedClips(true).then((c) => {
      if (!alive) return;
      setRecorded(c);
      setLoaded(true);
      // Mở trang là nhảy tới câu đầu tiên chưa thu.
      const next = order.find((t) => !c[t]);
      if (next) setCurrent(next);
    });
    return () => {
      alive = false;
      if (tickRef.current) clearInterval(tickRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [order]);

  function play(url: string) {
    playerRef.current?.pause();
    const a = new Audio(url);
    playerRef.current = a;
    a.play().catch(() => setError("Không phát được file này."));
  }

  function select(text: string) {
    if (phase === "recording" || phase === "saving") return;
    if (take) URL.revokeObjectURL(take.url);
    setTake(null);
    setPhase("idle");
    setError(null);
    setCurrent(text);
  }

  async function startRecording() {
    setError(null);
    if (take) URL.revokeObjectURL(take.url);
    setTake(null);
    try {
      if (!streamRef.current) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      }
    } catch {
      setError("Không mở được micro. Bấm vào biểu tượng ổ khoá trên thanh địa chỉ và cho phép dùng micro.");
      return;
    }
    const rec = new MediaRecorder(streamRef.current);
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    rec.onstop = async () => {
      if (tickRef.current) clearInterval(tickRef.current);
      setPhase("processing");
      try {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const { wav, seconds } = await toCleanWav(blob);
        const url = URL.createObjectURL(wav);
        setTake({ url, wav, seconds });
        setPhase("review");
        play(url);
      } catch (e) {
        setPhase("idle");
        setError(
          e instanceof Error && e.message === "silent"
            ? "Không nghe thấy tiếng. Nói to hơn một chút hoặc lại gần micro rồi thu lại nhé."
            : "Không xử lý được bản thu, thử thu lại nhé."
        );
      }
    };
    recRef.current = rec;
    rec.start();
    setElapsed(0);
    const t0 = Date.now();
    tickRef.current = setInterval(() => {
      const s = (Date.now() - t0) / 1000;
      setElapsed(s);
      if (s >= MAX_SECONDS && rec.state === "recording") rec.stop();
    }, 100);
    setPhase("recording");
  }

  function stopRecording() {
    if (recRef.current?.state === "recording") recRef.current.stop();
  }

  async function save() {
    if (!take) return;
    setPhase("saving");
    setError(null);
    try {
      const body = new FormData();
      body.append("text", current);
      body.append("file", take.wav, "ban-thu.wav");
      const res = await fetch("/api/game-audio", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      const next = { ...recorded, [current]: data.url as string };
      setRecorded(next);
      URL.revokeObjectURL(take.url);
      setTake(null);
      setPhase("idle");
      // Sang câu chưa thu kế tiếp (tính từ câu vừa lưu, vòng lại đầu nếu hết).
      const i = order.indexOf(current);
      const after = [...order.slice(i + 1), ...order.slice(0, i)].find((t) => !next[t]);
      if (after) setCurrent(after);
    } catch (e) {
      setPhase("review");
      setError(`Lưu thất bại: ${e instanceof Error ? e.message : "lỗi mạng"}`);
    }
  }

  async function removeRecording() {
    if (!confirm(`Xoá bản thu "${current}"? Trò chơi sẽ quay về giọng máy cho câu này.`)) return;
    setError(null);
    const res = await fetch(`/api/game-audio?text=${encodeURIComponent(current)}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(`Xoá thất bại: ${data?.error ?? res.status}`);
      return;
    }
    const next = { ...recorded };
    delete next[current];
    setRecorded(next);
  }

  const done = order.filter((t) => recorded[t]).length;
  const group = groupOf.get(current);
  const busy = phase === "recording" || phase === "processing" || phase === "saving";

  return (
    <div className="space-y-5">
      {/* Tiến độ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-gray-700">Đã thu {done}/{order.length} câu</span>
          {!loaded && <span className="text-gray-400">Đang tải…</span>}
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-green-500 transition-all" style={{ width: `${(done / order.length) * 100}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Câu nào chưa thu thì trò chơi tạm dùng giọng máy. Thu tới đâu, trò chơi dùng giọng thật tới đó.
        </p>
      </div>

      {/* Câu đang thu */}
      <div className="sticky top-16 z-10 bg-white rounded-2xl border-2 border-blue-200 shadow-md p-5 text-center">
        <p className="text-xs font-semibold text-blue-500 uppercase">{group?.title}</p>
        <p className="text-4xl sm:text-5xl font-extrabold text-gray-800 my-3 break-words">{current}</p>
        <p className="text-sm text-gray-500 mb-4">{group?.tip}</p>

        <div className="flex flex-wrap justify-center gap-2">
          {phase === "recording" ? (
            <button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl text-lg animate-pulse"
            >
              ⏹ Dừng ({elapsed.toFixed(1)}s)
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={busy}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-2xl text-lg"
            >
              🎙 {take || recorded[current] ? "Thu lại" : "Bắt đầu thu"}
            </button>
          )}
          {take && (
            <>
              <button
                onClick={() => play(take.url)}
                disabled={busy}
                className="bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-700 font-bold px-4 py-3 rounded-2xl"
              >
                ▶ Nghe lại
              </button>
              <button
                onClick={save}
                disabled={busy}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-2xl"
              >
                {phase === "saving" ? "Đang lưu…" : "💾 Lưu & sang câu tiếp"}
              </button>
            </>
          )}
        </div>

        {phase === "processing" && <p className="text-sm text-gray-500 mt-3">Đang xử lý bản thu…</p>}
        {take && <p className="text-xs text-gray-400 mt-2">Bản thu dài {take.seconds.toFixed(1)} giây (đã tự cắt khoảng lặng).</p>}
        {error && <p className="text-sm text-red-600 mt-3">✗ {error}</p>}

        <div className="flex flex-wrap justify-center gap-3 mt-4 text-sm">
          {recorded[current] && (
            <>
              <button onClick={() => play(recorded[current])} className="text-green-700 hover:underline">
                ▶ Bản đã lưu
              </button>
              <button onClick={removeRecording} disabled={busy} className="text-red-500 hover:underline">
                🗑 Xoá bản thu
              </button>
            </>
          )}
          {piper[current] && (
            <button onClick={() => play(piper[current])} className="text-gray-500 hover:underline">
              🔊 Giọng máy hiện tại
            </button>
          )}
        </div>
      </div>

      {/* Danh sách câu */}
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
        Chỉ hiện câu chưa thu
      </label>
      {groups.map((g) => {
        const texts = g.texts.filter((t) => !onlyMissing || !recorded[t]);
        if (!texts.length) return null;
        return (
          <div key={g.id}>
            <p className="text-sm font-bold text-gray-700 mb-2">
              {g.title}{" "}
              <span className="font-normal text-gray-400">
                ({g.texts.filter((t) => recorded[t]).length}/{g.texts.length})
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {texts.map((t) => (
                <button
                  key={t}
                  onClick={() => select(t)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    t === current
                      ? "bg-blue-600 border-blue-600 text-white"
                      : recorded[t]
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
                  }`}
                >
                  {recorded[t] && t !== current ? "✓ " : ""}
                  {t}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
