import Link from 'next/link'
import Header from '@/components/Header'
import { getUser } from '@/lib/supabase/server-client'
import { getSupabaseServer } from '@/lib/supabase/server'

type ResultRow = {
  id: number
  score: number
  total: number
  created_at: string
  lesson_id: number
}

type LessonInfo = {
  id: number
  title: string
  subjectName: string
  grade: number
}

async function getUserResults(userId: string): Promise<ResultRow[]> {
  const sb = getSupabaseServer()
  const { data } = await sb
    .from('quiz_results')
    .select('id, score, total, created_at, lesson_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as ResultRow[]
}

async function getLessonInfoBatch(lessonIds: number[]): Promise<Map<number, LessonInfo>> {
  if (!lessonIds.length) return new Map()
  const sb = getSupabaseServer()
  const { data: lessons } = await sb
    .from('lessons')
    .select('id, title, chapter_id')
    .in('id', lessonIds)

  if (!lessons?.length) return new Map()

  const chapterIds = [...new Set(lessons.map((l: any) => l.chapter_id))]
  const { data: chapters } = await sb
    .from('chapters')
    .select('id, subject_id')
    .in('id', chapterIds)

  const subjectIds = [...new Set((chapters ?? []).map((c: any) => c.subject_id))]
  const { data: subjects } = await sb
    .from('subjects')
    .select('id, name, grade')
    .in('id', subjectIds)

  const chapterMap = new Map((chapters ?? []).map((c: any) => [c.id, c]))
  const subjectMap = new Map((subjects ?? []).map((s: any) => [s.id, s]))

  const result = new Map<number, LessonInfo>()
  for (const l of lessons as any[]) {
    const chapter = chapterMap.get(l.chapter_id)
    const subject = chapter ? subjectMap.get(chapter.subject_id) : null
    result.set(l.id, {
      id: l.id,
      title: l.title,
      subjectName: subject?.name ?? 'Không rõ',
      grade: subject?.grade ?? 0,
    })
  }
  return result
}

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = Math.round((score / total) * 100)
  const color = pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {score}/{total} · {pct}%
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function ProgressPage() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 max-w-md mx-auto">
            <p className="text-5xl mb-5">📊</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Tiến độ học tập</h2>
            <p className="text-gray-500 text-sm mb-7">
              Đăng nhập để xem lịch sử bài làm và theo dõi tiến độ học tập của bạn.
            </p>
            <div className="flex flex-col gap-3 items-center">
              <Link
                href="/login?redirect=/progress"
                className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link href="/" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
                Tiếp tục ôn tập không cần đăng nhập →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const results = await getUserResults(user.id)
  const uniqueLessonIds = [...new Set(results.map((r) => r.lesson_id))]
  const lessonMap = await getLessonInfoBatch(uniqueLessonIds)

  // Stats
  const totalAttempts = results.length
  const uniqueLessons = uniqueLessonIds.length
  const avgPct = results.length
    ? Math.round(results.reduce((s, r) => s + (r.score / r.total) * 100, 0) / results.length)
    : 0

  // Best score per lesson
  const bestByLesson = new Map<number, number>()
  for (const r of results) {
    const pct = Math.round((r.score / r.total) * 100)
    if (!bestByLesson.has(r.lesson_id) || pct > bestByLesson.get(r.lesson_id)!) {
      bestByLesson.set(r.lesson_id, pct)
    }
  }
  const perfectCount = [...bestByLesson.values()].filter((p) => p === 100).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-800">Tiến độ học tập</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Lần làm bài', value: totalAttempts, color: 'text-blue-600' },
            { label: 'Bài đã luyện', value: uniqueLessons, color: 'text-indigo-600' },
            { label: 'Điểm TB', value: `${avgPct}%`, color: avgPct >= 80 ? 'text-green-600' : avgPct >= 50 ? 'text-yellow-600' : 'text-red-600' },
            { label: 'Hoàn hảo 100%', value: perfectCount, color: 'text-orange-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">Bạn chưa làm bài nào.</p>
            <Link href="/" className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors">
              Bắt đầu luyện tập
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-700 text-sm">Lịch sử làm bài ({totalAttempts} lần)</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {results.map((r) => {
                const info = lessonMap.get(r.lesson_id)
                return (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0 mr-4">
                      <Link
                        href={`/quiz?lessonId=${r.lesson_id}`}
                        className="font-medium text-sm text-gray-800 hover:text-blue-600 truncate block"
                      >
                        {info?.title ?? `Bài ${r.lesson_id}`}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        {info && (
                          <span className="text-xs text-gray-400">
                            Lớp {info.grade} · {info.subjectName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <ScoreBadge score={r.score} total={r.total} />
                      <span className="text-xs text-gray-400 hidden sm:block">{formatDate(r.created_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
