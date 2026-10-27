"use client";
import { useState } from "react";
import { Check, Copy, Swords, Trophy } from "lucide-react";
import { challengeText, challengeUrl, cleanName, MAX_NAME, verdict, type Challenge } from "@/lib/challenge";
import { track } from "@/lib/usage";

const NAME_KEY = "ontap_challenge_name";

function savedName(): string {
  try { return cleanName(window.localStorage.getItem(NAME_KEY)); } catch { return ""; }
}

/** Kết quả so điểm khi bài được mở từ một link thách. */
export function ChallengeVerdict({ challenge, correct }: { challenge: Challenge; correct: number }) {
  const v = verdict(correct, challenge.score);
  const who = challenge.name || "bạn ấy";
  const text = {
    win: `Bạn thắng ${who} rồi! Giỏi quá!`,
    draw: `Hoà nhau với ${who}! Ngang tài ngang sức.`,
    lose: `${who.charAt(0).toUpperCase()}${who.slice(1)} hơn bạn ${challenge.score - correct} câu. Làm lại để thắng nhé!`,
  }[v];
  const tone = v === "win" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : v === "draw" ? "border-sky-200 bg-sky-50 text-sky-900" : "border-amber-200 bg-amber-50 text-amber-900";
  return (
    <div className={`mb-5 rounded-2xl border-2 px-5 py-4 ${tone}`}>
      <p className="flex items-center gap-2 font-extrabold">
        <Trophy className="h-5 w-5" aria-hidden />
        {text}
      </p>
      <p className="mt-1 text-sm tabular-nums">
        Bạn: <b>{correct}/{challenge.total}</b> · {challenge.name || "Người thách"}: <b>{challenge.score}/{challenge.total}</b>
      </p>
    </div>
  );
}

/** Nút "Thách bạn làm đề này": gửi link mở lại đúng bộ câu, kèm điểm và tên gọi. */
export default function ChallengeShare({ shareHref, correct, total, title, grade }: {
  shareHref: string; correct: number; total: number; title: string; grade?: number | null;
}) {
  const [name, setName] = useState(savedName);
  const [copied, setCopied] = useState<string | null>(null);

  async function share() {
    const n = cleanName(name);
    try { window.localStorage.setItem(NAME_KEY, n); } catch {/* không lưu được thì thôi */}
    const url = challengeUrl(window.location.origin, shareHref, correct, total, n);
    const text = challengeText(n, correct, total, title);
    track("challenge_share", { grade: grade ?? null, detail: title });
    // Điện thoại: bảng chia sẻ của máy (Zalo, Messenger…). Máy tính: chép link.
    if (navigator.share) {
      try { await navigator.share({ title: "Thách bạn làm đề", text, url }); return; } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied("Đã chép lời thách và link — dán vào Zalo, Messenger để gửi bạn nhé.");
    } catch {
      setCopied(url); // không chép được: hiện link để tự chép
    }
  }

  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <p className="flex items-center gap-2 font-extrabold text-slate-800">
        <Swords className="h-5 w-5 text-primary-600" aria-hidden />
        Thách bạn làm đề này
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Gửi link cho bạn bè, anh chị em hay bố mẹ: mở ra đúng bộ câu bạn vừa làm, làm xong sẽ so điểm với bạn.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="challenge-name">Tên gọi của bạn</label>
        <input
          id="challenge-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME}
          placeholder="Tên gọi của bạn (không bắt buộc)"
          className="min-h-11 flex-1 rounded-xl border-2 border-slate-200 px-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none sm:text-sm"
        />
        <button
          type="button"
          onClick={share}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-b-4 border-primary-800 bg-primary-600 px-5 text-sm font-extrabold text-white hover:bg-primary-700 active:translate-y-0.5 active:border-b-2"
        >
          <Swords className="h-4 w-4" aria-hidden />
          Gửi lời thách
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">Chỉ ghi tên gọi ở nhà hoặc biệt danh, không cần họ tên đầy đủ.</p>
      {copied && (
        <p className="mt-2 flex items-start gap-1.5 break-all text-sm text-emerald-700" role="status">
          {copied.startsWith("http") ? <Copy className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden /> : <Check className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />}
          {copied}
        </p>
      )}
    </div>
  );
}
