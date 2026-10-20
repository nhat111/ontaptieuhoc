import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { getSupabaseServer } from "@/lib/supabase/server";
import { USAGE_EVENTS, type UsageEventName } from "@/lib/usage";

// Lượt dùng các tính năng (lib/usage.ts). Nằm trong /import nên theo khoá của
// app/import/layout.tsx. Số liệu không định danh nên không khoá chặt như hộp thư góp ý.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thống kê lượt dùng",
  robots: { index: false, follow: false },
};

const NAMES = Object.keys(USAGE_EVENTS) as UsageEventName[];
const DAY = 24 * 60 * 60 * 1000;
/** Đọc tối đa ngần này dòng 30 ngày gần nhất để chia theo lớp / chi tiết. Tổng thì luôn đếm đủ. */
const MAX_ROWS = 20000;
const PAGE = 1000;

type Row = { name: string; grade: number | null; detail: string | null };

async function countSince(name: string, since: Date): Promise<number> {
  const { count, error } = await getSupabaseServer()
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("name", name)
    .gte("created_at", since.toISOString());
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function load() {
  const now = Date.now();
  const d1 = new Date(now - DAY), d7 = new Date(now - 7 * DAY), d30 = new Date(now - 30 * DAY);
  try {
    const totals = await Promise.all(
      NAMES.map(async (name) => ({
        name,
        day: await countSince(name, d1),
        week: await countSince(name, d7),
        month: await countSince(name, d30),
      }))
    );
    const rows: Row[] = [];
    for (let from = 0; from < MAX_ROWS; from += PAGE) {
      const { data, error } = await getSupabaseServer()
        .from("usage_events")
        .select("name, grade, detail")
        .gte("created_at", d30.toISOString())
        .order("created_at", { ascending: false })
        .range(from, from + PAGE - 1);
      if (error) throw new Error(error.message);
      rows.push(...((data ?? []) as Row[]));
      if (!data || data.length < PAGE) break;
    }
    return { totals, rows, truncated: rows.length >= MAX_ROWS };
  } catch (e) {
    return { totals: [], rows: [], truncated: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function tally<T extends string | number>(items: T[]): [T, number][] {
  const m = new Map<T, number>();
  for (const it of items) m.set(it, (m.get(it) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1]);
}

export default async function UsageStatsPage() {
  const { totals, rows, truncated, error } = await load();
  const used = totals.filter((t) => t.month > 0);
  const byGrade = tally(rows.filter((r) => r.grade).map((r) => r.grade as number));
  const detailsOf = (name: string) => tally(rows.filter((r) => r.name === name && r.detail).map((r) => r.detail as string)).slice(0, 8);
  const maxGrade = Math.max(1, ...byGrade.map(([, n]) => n));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-extrabold text-gray-800">📊 Thống kê lượt dùng</h1>
          <Link href="/import" className="text-sm font-semibold text-blue-600 hover:underline">← Khu soạn đề</Link>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Mỗi lần bấm một nút chính được đếm một lượt. Không lưu IP, tài khoản hay nội dung bài làm.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Không đọc được số liệu: {error}
            {/relation .*usage_events.* does not exist|Could not find the table/i.test(error) && (
              <p className="mt-2">
                Bảng <code>usage_events</code> chưa có — chạy đoạn SQL “ĐẾM LƯỢT DÙNG” ở cuối <code>schema.sql</code> trong Supabase SQL Editor.
              </p>
            )}
          </div>
        )}

        {!error && used.length === 0 && (
          <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-10 text-center text-gray-500">
            <p className="text-4xl">🌱</p>
            <p className="mt-2 font-semibold">Chưa có lượt dùng nào trong 30 ngày qua.</p>
          </div>
        )}

        {used.length > 0 && (
          <>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left font-bold">Tính năng</th>
                    <th className="px-3 py-2 text-right font-bold">24 giờ</th>
                    <th className="px-3 py-2 text-right font-bold">7 ngày</th>
                    <th className="px-4 py-2 text-right font-bold">30 ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {[...used].sort((a, b) => b.month - a.month).map((t) => (
                    <tr key={t.name} className="border-t border-gray-100">
                      <td className="px-4 py-2 font-semibold text-gray-800">{USAGE_EVENTS[t.name]}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-600">{t.day}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-600">{t.week}</td>
                      <td className="px-4 py-2 text-right font-bold tabular-nums text-gray-800">{t.month}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {byGrade.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-extrabold text-gray-800">Theo lớp (30 ngày)</h2>
                <ul className="mt-3 space-y-1.5">
                  {[...byGrade].sort((a, b) => a[0] - b[0]).map(([g, n]) => (
                    <li key={g} className="flex items-center gap-3 text-sm">
                      <span className="w-14 shrink-0 font-bold text-gray-700">Lớp {g}</span>
                      <span className="h-3 rounded-full bg-blue-500" style={{ width: `${(n / maxGrade) * 70}%` }} />
                      <span className="tabular-nums text-gray-600">{n}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-8">
              <h2 className="text-lg font-extrabold text-gray-800">Chi tiết hay dùng nhất (30 ngày)</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {used.map((t) => {
                  const top = detailsOf(t.name);
                  if (top.length === 0) return null;
                  return (
                    <div key={t.name} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-bold text-gray-800">{USAGE_EVENTS[t.name]}</p>
                      <ul className="mt-2 space-y-1 text-xs text-gray-600">
                        {top.map(([d, n]) => (
                          <li key={d} className="flex justify-between gap-3">
                            <span className="break-all">{d}</span>
                            <span className="shrink-0 font-bold tabular-nums">{n}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              {truncated && (
                <p className="mt-3 text-xs text-gray-400">
                  Phần chia theo lớp / chi tiết chỉ tính {MAX_ROWS.toLocaleString("vi-VN")} lượt gần nhất; bảng tổng ở trên vẫn đếm đủ.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
