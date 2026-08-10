import { cache } from 'react'
import { getSupabaseServer } from './supabase/server'
import type { Question as QuizQuestion, LessonMeta, QType } from './quizData'

// ---- Database row types ----

export type SubjectRow = {
  id: number
  name: string
  grade: number
  order_index: number
}

export type Subject = SubjectRow

export type Chapter = {
  id: number
  title: string
  subject_id: number
  order_index: number
}

export type Lesson = {
  id: number
  title: string
  index_label: string
  chapter_id: number
  status: 'completed' | 'active' | 'locked'
  order_index: number
}

export type Question = {
  id: number
  content: string
  options: string[]
  correct_answer: string
  explanation: string | null
}

// ---- Component types (used by server-side pages) ----

type ComponentLesson = {
  id: number
  index: string
  title: string
  questionCount: number
  status: 'completed' | 'active' | 'locked'
}

type ComponentChapter = {
  id: number
  title: string
  questionCount: number
  lessons: ComponentLesson[]
}

// ---- Leaderboard ----

export type LeaderboardEntry = {
  rank: number
  name: string
  avgScore: number
  lessonCount: number
}

function maskEmail(email: string): string {
  const local = email.split('@')[0]
  if (local.length <= 3) return local
  return local.slice(0, 3) + '***'
}

export async function getLeaderboardByGrade(grade: number): Promise<LeaderboardEntry[]> {
  try {
    const sb = getSupabaseServer()

    const { data: chapters } = await sb
      .from('chapters')
      .select('id, subjects!inner(grade)')
      .eq('subjects.grade', grade)
    if (!chapters?.length) return []

    const { data: lessons } = await sb.from('lessons').select('id').in('chapter_id', chapters.map((c: any) => c.id))
    if (!lessons?.length) return []

    const lessonIds = lessons.map((l: any) => l.id)

    const { data: results } = await sb
      .from('quiz_results')
      .select('user_id, lesson_id, score, total')
      .in('lesson_id', lessonIds)
      .not('user_id', 'is', null)

    if (!results?.length) return []

    // Best score % per (user, lesson)
    const userBest = new Map<string, Map<number, number>>()
    for (const r of results as any[]) {
      if (!r.user_id) continue
      const pct = (r.score / r.total) * 100
      if (!userBest.has(r.user_id)) userBest.set(r.user_id, new Map())
      const lm = userBest.get(r.user_id)!
      if (!lm.has(r.lesson_id) || pct > lm.get(r.lesson_id)!) lm.set(r.lesson_id, pct)
    }

    const stats = [...userBest.entries()]
      .map(([userId, lm]) => {
        const scores = [...lm.values()]
        return { userId, lessonCount: scores.length, avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) }
      })
      .sort((a, b) => b.avgScore - a.avgScore || b.lessonCount - a.lessonCount)
      .slice(0, 10)

    const userIds = stats.map((s) => s.userId)
    const { data: { users } } = await sb.auth.admin.listUsers({ perPage: 1000 })
    const emailMap = new Map((users ?? []).map((u: any) => [u.id, u.email ?? '']))

    return stats.map((s, i) => ({
      rank: i + 1,
      name: maskEmail(emailMap.get(s.userId) ?? 'user'),
      avgScore: s.avgScore,
      lessonCount: s.lessonCount,
    }))
  } catch {
    return []
  }
}

// ---- Subjects ----
//
// The subject catalogue lives in `lib/subjects.ts`, not in the DB — see that
// file. The `subjects` table is still the FK target for `chapters.subject_id`,
// so it is resolved by the (grade, name) pair rather than by a hard-coded id
// (ids are SERIAL and differ between databases).

/**
 * Id of the `subjects` row for a (grade, name) pair, creating it when missing
 * so a subject added to `lib/subjects.ts` works without a manual SQL insert.
 * Write paths only — reads filter through an embedded join instead.
 */
export async function ensureSubjectId(grade: number, name: string): Promise<number | null> {
  return (await ensureSubjectIdResult(grade, name)).id
}

/**
 * Bản có kèm lý do thất bại. Nuốt lỗi rồi trả null khiến người dùng chỉ thấy
 * "không tạo được" mà không biết vì sao — write path cần nói rõ nguyên nhân.
 */
export async function ensureSubjectIdResult(
  grade: number,
  name: string
): Promise<{ id: number | null; error?: string }> {
  try {
    const sb = getSupabaseServer()

    const { data: existing, error: selErr } = await sb
      .from('subjects')
      .select('id')
      .eq('grade', grade)
      .eq('name', name)
      .limit(1)
      .maybeSingle()
    if (selErr) {
      console.error('[ensureSubjectId] select', selErr)
      return { id: null, error: `Không đọc được bảng subjects: ${selErr.message}` }
    }
    if (existing) return { id: existing.id }

    const { data: created, error } = await sb
      .from('subjects')
      .insert({ name, grade, order_index: 0 })
      .select('id')
      .single()
    if (error) {
      console.error('[ensureSubjectId] insert', error)
      return { id: null, error: describeWriteError('subjects', error) }
    }
    if (!created?.id) {
      return { id: null, error: 'Insert vào bảng "subjects" không trả về id nào.' }
    }
    return { id: created.id }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[ensureSubjectId]', msg)
    return { id: null, error: msg }
  }
}

/**
 * Đổi lỗi Postgres thành câu tiếng Việt kèm cách sửa.
 *
 * `23505` trên khoá chính là bẫy hay gặp nhất ở DB này: `schema.sql` seed dữ
 * liệu bằng id cố định nên SERIAL bị tụt lại, insert sau đó đụng id đã tồn tại.
 */
function describeWriteError(table: string, error: { code?: string; message: string }): string {
  if (error.code === '23505' && /_pkey/.test(error.message)) {
    return (
      `Bảng "${table}" bị lệch bộ đếm id (SERIAL) nên insert trùng khoá chính. ` +
      `Chạy trong Supabase SQL editor: ` +
      `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1));`
    )
  }
  if (error.code === '42P01') return `Chưa có bảng "${table}" trong DB — chạy schema.sql trước.`
  if (error.code === '42703') return `Bảng "${table}" thiếu cột mà app cần: ${error.message}`
  return `Ghi vào "${table}" thất bại: ${error.message}`
}

/**
 * Chương mặc định của một môn, tạo nếu chưa có.
 *
 * `lessons.chapter_id` là NOT NULL, và `/lop/[grade]` nhóm bài theo chương nên
 * bài không thuộc chương nào sẽ không bao giờ hiện lên web. Vì vậy khi người
 * dùng không chọn chương, ta gom vào một chương mặc định thay vì nới ràng buộc
 * — bài vẫn hiển thị bình thường và có thể đổi tên chương sau.
 */
export async function ensureDefaultChapterId(
  grade: number,
  subjectName: string,
  lessonType: 'lesson' | 'exam' = 'lesson'
): Promise<number | null> {
  return (await ensureDefaultChapterIdResult(grade, subjectName, lessonType)).id
}

/** Bản có kèm lý do thất bại — xem ensureSubjectIdResult. */
export async function ensureDefaultChapterIdResult(
  grade: number,
  subjectName: string,
  lessonType: 'lesson' | 'exam' = 'lesson'
): Promise<{ id: number | null; error?: string }> {
  const title = lessonType === 'exam' ? 'Đề kiểm tra' : 'Chưa phân chương'

  try {
    const subject = await ensureSubjectIdResult(grade, subjectName)
    if (!subject.id) {
      return { id: null, error: subject.error ?? `Không tạo được môn "${subjectName}" lớp ${grade}.` }
    }

    const sb = getSupabaseServer()
    const { data: existing, error: selErr } = await sb
      .from('chapters')
      .select('id')
      .eq('subject_id', subject.id)
      .eq('title', title)
      .limit(1)
      .maybeSingle()
    if (selErr) {
      console.error('[ensureDefaultChapterId] select', selErr)
      return { id: null, error: `Không đọc được bảng chapters: ${selErr.message}` }
    }
    if (existing) return { id: existing.id }

    const { data: created, error } = await sb
      .from('chapters')
      .insert({ title, subject_id: subject.id, order_index: 999 })
      .select('id')
      .single()
    if (error) {
      console.error('[ensureDefaultChapterId] insert', error)
      return { id: null, error: describeWriteError('chapters', error) }
    }
    if (!created?.id) {
      return { id: null, error: 'Insert vào bảng "chapters" không trả về id nào.' }
    }
    return { id: created.id }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[ensureDefaultChapterId]', msg)
    return { id: null, error: msg }
  }
}

// ---- Chapters (server-side, returns rich component types for server pages) ----

export async function getChaptersWithLessons(
  grade: number,
  subjectName: string,
  lessonType: 'lesson' | 'exam' = 'lesson'
): Promise<ComponentChapter[]> {
  try {
    const sb = getSupabaseServer()

    // `subjects!inner` makes the embedded filters actually restrict the rows,
    // so this is one round trip instead of a subject lookup then a chapter query.
    const { data: chapters } = await sb
      .from('chapters')
      .select('id, title, order_index, subjects!inner(grade, name)')
      .eq('subjects.grade', grade)
      .eq('subjects.name', subjectName)
      .order('order_index')

    if (!chapters?.length) return []

    const chapterIds = chapters.map((c: any) => c.id)

    let query = sb
      .from('lessons')
      .select('id, title, index_label, chapter_id, status, order_index, questions(count)')
      .in('chapter_id', chapterIds)
      .order('order_index')

    if (lessonType === 'exam') {
      query = query.eq('type', 'exam') as typeof query
    } else {
      query = query.or('type.eq.lesson,type.is.null') as typeof query
    }

    const { data: lessons } = await query

    return chapters
      .map((ch: any) => {
        const chLessons: ComponentLesson[] = (lessons ?? [])
          .filter((l: any) => l.chapter_id === ch.id)
          .map((l: any) => ({
            id: l.id,
            index: l.index_label,
            title: l.title,
            questionCount: l.questions?.[0]?.count ?? 0,
            status: l.status as ComponentLesson['status'],
          }))
        return {
          id: ch.id,
          title: ch.title,
          questionCount: chLessons.reduce((s, l) => s + l.questionCount, 0),
          lessons: chLessons,
        }
      })
      .filter((ch: ComponentChapter) => ch.lessons.length > 0)
  } catch {
    return []
  }
}

// ---- Server-side quiz functions (for server components) ----

// `cache` de-dupes these two per request: /quiz calls each of them twice, once
// from generateMetadata and once from the page body.
export const getQuestionsFromDB = cache(async function getQuestionsFromDB(
  lessonId: number
): Promise<QuizQuestion[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('questions')
      .select('id, content, options, correct_answer, type, explanation')
      .eq('lesson_id', lessonId)
      .order('order_index')

    return (data ?? []).map((q: any) => {
      let images: { url: string; position: 'before' | 'after' }[] = []
      let imageUrl: string | undefined
      let explanation: string | undefined
      let audioUrl: string | undefined
      try {
        const exp = typeof q.explanation === 'string' ? JSON.parse(q.explanation) : q.explanation
        if (Array.isArray(exp?.images)) {
          images = exp.images
            .filter((img: any) => img && typeof img.url === 'string' && img.url)
            .map((img: any) => ({
              url: img.url as string,
              position: img.position === 'before' ? 'before' : 'after',
            }))
        } else if (exp?.imageUrl) {
          images = [{ url: exp.imageUrl, position: 'after' }]
        }
        if (exp?.imageUrl) imageUrl = exp.imageUrl
        else if (images[0]?.url) imageUrl = images[0].url
        if (typeof exp?.solution === 'string' && exp.solution.trim()) explanation = exp.solution
        if (typeof exp?.audioUrl === 'string' && exp.audioUrl.trim()) audioUrl = exp.audioUrl
      } catch {}
      return {
        id: q.id,
        type: ((q.type as QType | null) ?? 'mcq') as QType,
        question: q.content,
        options: (q.options ?? []) as string[],
        correctAnswer: q.correct_answer,
        images,
        imageUrl,
        explanation,
        audioUrl,
      }
    })
  } catch {
    return []
  }
})

export const getLessonMetaFromDB = cache(async function getLessonMetaFromDB(
  lessonId: number
): Promise<LessonMeta> {
  try {
    const sb = getSupabaseServer()
    const { data: lesson } = await sb
      .from('lessons')
      .select('id, title, chapter_id, duration_minutes')
      .eq('id', lessonId)
      .single()
    if (!lesson) return { id: lessonId, title: `Bài ${lessonId}` }

    const { data: chapter } = await sb
      .from('chapters')
      .select('subject_id')
      .eq('id', lesson.chapter_id)
      .single()

    let grade: number | null = null
    let subjectName: string | null = null
    if (chapter) {
      const { data: subject } = await sb
        .from('subjects')
        .select('grade, name')
        .eq('id', chapter.subject_id)
        .single()
      if (subject) { grade = subject.grade; subjectName = subject.name }
    }

    return {
      id: lesson.id,
      title: lesson.title,
      grade,
      subjectName,
      durationMinutes: (lesson as any).duration_minutes ?? 15,
    }
  } catch {}
  return { id: lessonId, title: `Bài ${lessonId}` }
})

// ---- All exams (for /de-thi) ----

export type ExamListItem = {
  id: number
  title: string
  indexLabel: string
  durationMinutes: number
  questionCount: number
  grade: number
  subjectName: string
}

export async function getAllExams(): Promise<ExamListItem[]> {
  try {
    const sb = getSupabaseServer()
    const { data: lessons } = await sb
      .from('lessons')
      .select('id, title, index_label, duration_minutes, chapter_id, questions(count)')
      .eq('type', 'exam')
      .order('id', { ascending: false })

    if (!lessons?.length) return []

    const chapterIds = [...new Set((lessons as any[]).map((l) => l.chapter_id))]
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

    return (lessons as any[]).map((l) => {
      const chapter = chapterMap.get(l.chapter_id)
      const subject = chapter ? subjectMap.get((chapter as any).subject_id) : null
      return {
        id: l.id,
        title: l.title,
        indexLabel: l.index_label,
        durationMinutes: l.duration_minutes ?? 15,
        questionCount: l.questions?.[0]?.count ?? 0,
        grade: (subject as any)?.grade ?? 0,
        subjectName: (subject as any)?.name ?? '',
      }
    })
  } catch {
    return []
  }
}

// ---- Sitemap ----

/**
 * Ids of every lesson that actually has questions — a `/quiz?lessonId=` page
 * with no questions is a dead end, so it is kept out of the sitemap.
 */
export async function getIndexableLessonIds(): Promise<number[]> {
  try {
    const { data } = await getSupabaseServer()
      .from('lessons')
      .select('id, questions(count)')
      .order('id')
    return (data ?? [])
      .filter((l: any) => (l.questions?.[0]?.count ?? 0) > 0)
      .map((l: any) => l.id as number)
  } catch {
    return []
  }
}

// ---- Chapter dashboard ----

export type ChapterContext = {
  chapterId: number
  chapterTitle: string
  subjectId: number
  subjectName: string
  grade: number
}

export type ChapterLesson = {
  id: number
  title: string
  indexLabel: string
  type: 'lesson' | 'exam' | null
  durationMinutes: number
  questionCount: number
}

export async function getChapterContext(chapterId: number): Promise<ChapterContext | null> {
  try {
    const sb = getSupabaseServer()
    const { data: chapter } = await sb
      .from('chapters')
      .select('id, title, subject_id')
      .eq('id', chapterId)
      .single()
    if (!chapter) return null
    const { data: subject } = await sb
      .from('subjects')
      .select('id, name, grade')
      .eq('id', chapter.subject_id)
      .single()
    if (!subject) return null
    return {
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      subjectId: subject.id,
      subjectName: subject.name,
      grade: subject.grade,
    }
  } catch {
    return null
  }
}

export async function getLessonsInChapter(chapterId: number): Promise<ChapterLesson[]> {
  try {
    const sb = getSupabaseServer()
    const { data } = await sb
      .from('lessons')
      .select('id, title, index_label, type, duration_minutes, questions(count)')
      .eq('chapter_id', chapterId)
      .order('id', { ascending: true })
    if (!data) return []
    return (data as any[]).map((l) => ({
      id: l.id,
      title: l.title,
      indexLabel: l.index_label,
      type: (l.type === 'exam' ? 'exam' : l.type === 'lesson' ? 'lesson' : null) as ChapterLesson['type'],
      durationMinutes: l.duration_minutes ?? 15,
      questionCount: l.questions?.[0]?.count ?? 0,
    }))
  } catch {
    return []
  }
}
