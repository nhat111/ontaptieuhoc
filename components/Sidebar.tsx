import { Medal, Star, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/db";
import CuteAvatar from "@/components/CuteAvatar";

// Ba hạng đầu: huy chương Vàng / Bạc / Đồng (Lucide Medal) và nền nhạt cùng màu.
const MEDALS = [
  { label: "Huy chương Vàng", row: "bg-star-50 ring-1 ring-star-200", medal: "bg-star-400 text-white", ring: "ring-star-400" },
  { label: "Huy chương Bạc", row: "bg-slate-50 ring-1 ring-slate-200", medal: "bg-slate-400 text-white", ring: "ring-slate-300" },
  { label: "Huy chương Đồng", row: "bg-orange-50 ring-1 ring-orange-200", medal: "bg-orange-400 text-white", ring: "ring-orange-300" },
];

const LEVELS = [
  { label: "Giỏi", desc: "từ 80%", dot: "bg-success-500" },
  { label: "Khá", desc: "từ 65%", dot: "bg-primary-500" },
  { label: "Trung bình", desc: "từ 50%", dot: "bg-star-500" },
  { label: "Cố gắng thêm", desc: "dưới 50%", dot: "bg-slate-300" },
];

export default function Sidebar({
  leaderboard = [],
  grade,
  loading = false,
}: {
  leaderboard?: LeaderboardEntry[];
  grade?: number;
  /** Bảng xếp hạng còn đang tải (fallback của Suspense trên /lop/[grade]). */
  loading?: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Leaderboard */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="bg-gradient-to-br from-star-50 via-white to-primary-50 px-5 pb-4 pt-5">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-star-400 text-white shadow-sm" aria-hidden>
              <Trophy className="h-5 w-5" />
            </span>
            Bảng xếp hạng{grade ? ` lớp ${grade}` : ""}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Mỗi bài tính lần làm tốt nhất, tối đa 100 điểm — làm càng nhiều bài càng nhiều điểm.
          </p>
        </div>

        <div className="px-3 pb-4">
          {loading ? (
            <ol className="space-y-1.5" aria-busy="true" aria-label="Đang tải bảng xếp hạng">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-3 rounded-xl px-2.5 py-2">
                  <span className="h-9 w-9 flex-shrink-0 rounded-full bg-slate-100 motion-safe:animate-pulse" />
                  <span className="h-3 flex-1 rounded bg-slate-100 motion-safe:animate-pulse" />
                </li>
              ))}
            </ol>
          ) : leaderboard.length === 0 ? (
            <div className="mx-2 rounded-xl border border-dashed border-slate-200 py-6 text-center">
              <Medal className="mx-auto h-6 w-6 text-slate-300" aria-hidden />
              <p className="mt-2 text-xs text-slate-500">Chưa có ai làm bài trong lớp này.</p>
              <p className="text-xs font-semibold text-primary-600">Con hãy là người đầu tiên nhé!</p>
            </div>
          ) : (
            <ol className="space-y-1.5">
              {leaderboard.map((row) => {
                const m = MEDALS[row.rank - 1];
                return (
                  <li key={row.rank} className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${m ? m.row : "hover:bg-slate-50"}`}>
                    <span className="relative flex-shrink-0">
                      <CuteAvatar name={row.name} size={m ? 40 : 34} className={m ? `rounded-full ring-2 ${m.ring}` : ""} />
                      {m ? (
                        <span
                          className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black shadow ${m.medal}`}
                          title={m.label}
                          aria-label={m.label}
                        >
                          {row.rank}
                        </span>
                      ) : (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
                          {row.rank}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm ${m ? "font-extrabold text-slate-900" : "font-semibold text-slate-800"}`}>{row.name}</p>
                      <p className="text-xs text-slate-500">
                        {row.lessonCount} bài · đúng TB {row.avgScore}%
                      </p>
                    </div>
                    <span className="inline-flex flex-shrink-0 items-center gap-1 text-sm font-extrabold tabular-nums text-slate-900">
                      <Star className="h-3.5 w-3.5 fill-star-400 text-star-400" aria-hidden />
                      {row.points}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>

      {/* Mức xếp loại */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <h3 className="mb-3 text-sm font-extrabold text-slate-900">Xếp loại theo điểm</h3>
        <ul className="space-y-2">
          {LEVELS.map((l) => (
            <li key={l.label} className="flex items-center gap-2.5 text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${l.dot}`} aria-hidden />
              <span className="font-semibold text-slate-700">{l.label}</span>
              <span className="ml-auto text-xs text-slate-500">{l.desc}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
          Bài đạt từ mức <b className="text-success-700">Giỏi</b> được đánh dấu hoàn thành trên máy này.
        </p>
      </div>
    </div>
  );
}
