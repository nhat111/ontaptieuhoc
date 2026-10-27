"use client";
import Link from "next/link";
import { Check, Flame, Lock, Play, RotateCcw, Sparkles, Star } from "lucide-react";
import { gradeTheme } from "@/lib/gradeTheme";
import { lessonState, type LessonProgressMap } from "@/lib/lessonProgress";
import {
  addDays, bestStreak, currentStreak, dayLabel, lessonStars, missionDays, missionHref, missionKey, MISSION_GRADES, MISSION_SIZE,
  nextStarSticker, pickBai, STICKERS, stickerUnlocked, type MissionBai,
} from "@/lib/mission";
import { STICKER_ART } from "@/lib/stickerArt";
import { track } from "@/lib/usage";
import { setMissionPrefs, useGameStars, useMissionPrefs, useProgress, useToday, type MissionPrefs } from "./hooks";

const THU = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function MissionHub({ lists }: { lists: Record<number, MissionBai[]> }) {
  const today = useToday();
  const progress = useProgress();
  const gameStars = useGameStars();
  const prefs = useMissionPrefs();

  // Ở server (và khoảnh khắc trước khi đọc được máy) chưa biết ngày, tiến độ: hiện khung trống.
  if (!today) return <div className="h-96 animate-pulse rounded-3xl bg-white/60" aria-hidden />;

  const days = missionDays(progress);
  const streak = currentStreak(days, today);
  const best = bestStreak(days);
  const stars = gameStars + lessonStars(progress);
  const grade = prefs.grade && lists[prefs.grade]?.length ? prefs.grade : null;

  return (
    <div className="space-y-6">
      {/* Chuỗi ngày */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${streak ? "bg-orange-100 text-orange-500" : "bg-slate-100 text-slate-400"}`} aria-hidden>
              <Flame className="h-7 w-7" />
            </span>
            <div>
              <p className="text-2xl font-black tabular-nums text-slate-900">{streak} ngày liên tục</p>
              <p className="text-sm text-slate-500">
                {streak ? (days.has(today) ? "Hôm nay xong rồi, mai làm tiếp nhé!" : "Làm nhiệm vụ hôm nay để giữ chuỗi nhé!") : "Mỗi ngày làm một nhiệm vụ để bắt đầu chuỗi."}
              </p>
            </div>
          </div>
          <p className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
            <span className="tabular-nums">{stars}</span> sao
          </p>
        </div>
        <ol className="mt-4 grid grid-cols-7 gap-1.5" aria-label="7 ngày gần nhất">
          {Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((d) => {
            const done = days.has(d);
            return (
              <li key={d} className="text-center">
                <span className="block text-[11px] font-semibold text-slate-400">{THU[new Date(`${d}T00:00:00Z`).getUTCDay()]}</span>
                <span
                  className={`mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                    done ? "border-orange-300 bg-orange-100 text-orange-600" : d === today ? "border-dashed border-primary-300 text-primary-400" : "border-slate-200 text-slate-300"
                  }`}
                  title={dayLabel(d)}
                >
                  {done ? <Flame className="h-4 w-4" aria-label="đã làm" /> : <span className="text-xs tabular-nums">{Number(d.slice(8))}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Chọn lớp + nhiệm vụ hôm nay */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
        <h2 className="text-lg font-extrabold text-slate-900">Nhiệm vụ hôm nay · {dayLabel(today)}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Con học lớp mấy?">
          <span className="mr-1 text-sm font-semibold text-slate-600">Con học lớp</span>
          {MISSION_GRADES.map((g) => {
            const on = g === grade;
            const t = gradeTheme(g);
            return (
              <button
                key={g}
                type="button"
                aria-pressed={on}
                onClick={() => setMissionPrefs({ grade: g })}
                className={`h-11 w-11 rounded-xl border-2 text-lg font-black tabular-nums transition-colors ${on ? `${t.soft} ${t.text} border-current` : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}
              >
                {g}
              </button>
            );
          })}
        </div>
        {grade ? <TodayMission grade={grade} list={lists[grade]} today={today} progress={progress} prefs={prefs} /> : (
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Chọn lớp của con để nhận nhiệm vụ: mỗi ngày {MISSION_SIZE} câu Toán theo đúng bài sách Kết nối tri thức con đang học.</p>
        )}
      </section>

      <Album stars={stars} gameStars={gameStars} best={best} />
    </div>
  );
}

function TodayMission({ grade, list, today, progress, prefs }: {
  grade: number; list: MissionBai[]; today: string; progress: LessonProgressMap; prefs: MissionPrefs;
}) {
    const picked = list.find((b) => b.so === prefs.bai[grade]);
    const auto = pickBai(list, progress, today)!;
    const bai = picked ?? auto.bai;
    const rec = progress[missionKey(grade, today)];
    const done = !!rec && rec.attempts > 0;
    const href = missionHref(grade, bai.so, today);

    return (
      <div className="mt-4 space-y-3">
        <div className={`rounded-2xl border-2 p-4 ${done ? "border-emerald-200 bg-emerald-50" : "border-primary-100 bg-primary-50/50"}`}>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Toán {grade} · {bai.label}</p>
          <p className="mt-0.5 text-lg font-extrabold text-slate-900">{bai.ten}</p>
          <p className="mt-1 text-sm text-slate-600">
            {MISSION_SIZE} câu: 3 câu bài này, 2 câu ôn bài trước. Có nút Kiểm tra từng câu.
          </p>
          {done ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-700">
                <Check className="h-4 w-4" aria-hidden /> Xong hôm nay · tốt nhất {Math.round((rec.best * MISSION_SIZE) / 100)}/{MISSION_SIZE}
              </span>
              <Link href={href} onClick={() => track("mission_start", { grade, detail: "làm lại" })}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:border-slate-300">
                <RotateCcw className="h-4 w-4" aria-hidden /> Làm lại
              </Link>
            </div>
          ) : (
            <Link href={href} onClick={() => track("mission_start", { grade, detail: bai.label })}
              className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-2xl border-b-4 border-primary-800 bg-primary-600 px-6 text-base font-extrabold text-white shadow-pop hover:bg-primary-700 active:translate-y-0.5 active:border-b-2">
              <Play className="h-5 w-5 fill-current" aria-hidden /> Làm nhiệm vụ
            </Link>
          )}
        </div>
        <label className="block text-sm text-slate-600">
          <span className="mb-1 block">
            {picked ? "Bài do bố mẹ chọn." : auto.from === "progress" ? "Theo bài con làm gần nhất trên máy." : "Ước theo tuần học trong năm."}
            {" "}Con đang học bài khác? Chọn lại:
          </span>
          <select
            value={picked ? String(picked.so) : ""}
            onChange={(e) => setMissionPrefs({ bai: { ...prefs.bai, [grade]: Number(e.target.value) || 0 } })}
            className="min-h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 text-base text-slate-700 focus:border-primary-400 focus:outline-none sm:text-sm"
          >
            <option value="">Tự chọn theo tiến độ ({auto.bai.label})</option>
            {list.map((b) => (
              <option key={b.so} value={b.so}>
                {b.label}. {b.ten}{lessonState(progress[b.key]) === "done" ? " ✓" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
}

function Album({ stars, gameStars, best }: { stars: number; gameStars: number; best: number }) {
  const owned = STICKERS.filter((s) => stickerUnlocked(s, stars, best)).length;
  const next = nextStarSticker(stars);
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6" aria-labelledby="album">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="album" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <Sparkles className="h-5 w-5 text-amber-500" aria-hidden />
          Album sticker
        </h2>
        <p className="text-sm font-semibold text-slate-500"><span className="tabular-nums">{owned}/{STICKERS.length}</span> sticker</p>
      </div>
      {next && (
        <div className="mt-3">
          <p className="text-sm text-slate-600">Thêm <b className="tabular-nums">{next.missing}</b> sao nữa để mở <b>{next.sticker.name}</b>.</p>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.max(4, Math.round((stars / (stars + next.missing)) * 100))}%` }} />
          </div>
        </div>
      )}
      <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {STICKERS.map((s) => {
          const on = stickerUnlocked(s, stars, best);
          return (
            <li key={s.id} className={`relative rounded-2xl border-2 p-2 text-center ${on ? "border-amber-200 bg-amber-50/60" : "border-dashed border-slate-200 bg-slate-50"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- hình SVG data URI tự vẽ */}
              <img src={STICKER_ART[s.id]} alt="" width={72} height={72} className={`mx-auto h-16 w-16 sm:h-[72px] sm:w-[72px] ${on ? "motion-safe:animate-pop" : "opacity-25 grayscale"}`} />
              <p className={`mt-1 text-xs font-bold ${on ? "text-slate-700" : "text-slate-400"}`}>{on ? s.name : "???"}</p>
              {!on && (
                <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-slate-400">
                  <Lock className="h-3 w-3" aria-hidden />
                  {"stars" in s.need ? `${s.need.stars} sao` : `${s.need.streak} ngày liền`}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-slate-500">
        Sao có từ trò chơi ({gameStars}) và từ bài làm: mỗi bài, đề hay nhiệm vụ được 1–3 sao theo điểm tốt nhất (từ 50% được 1 sao, 70% được 2 sao, 85% được 3 sao).
        Sticker ghi số sao mở khi đủ sao; sticker ghi “ngày liền” mở khi làm nhiệm vụ đủ số ngày liên tục (mở rồi thì giữ mãi). Mọi thứ lưu trên máy này, không cần đăng nhập.
      </p>
    </section>
  );
}
