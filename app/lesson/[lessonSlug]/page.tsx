import { notFound } from 'next/navigation'
import { LessonHeader }    from '@/components/lesson/LessonHeader'
import { ChapterList }     from '@/components/lesson/ChapterList'
import { RankingSidebar }  from '@/components/lesson/RankingSidebar'
import { getLessonBySlug } from '@/lib/services/lessons'
import { getQuestionsByLesson } from '@/lib/services/questions'
import { getResultsByLesson }   from '@/lib/services/results'

interface Props {
  params: Promise<{ lessonSlug: string }>
}

export default async function LessonPage({ params }: Props) {
  const { lessonSlug } = await params
  const lesson = await getLessonBySlug(lessonSlug)
  if (!lesson) notFound()

  const [questions, results] = await Promise.all([
    getQuestionsByLesson(lesson.id),
    getResultsByLesson(lesson.id, 10),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <LessonHeader lesson={lesson} />

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <ChapterList lessonSlug={lesson.slug} questions={questions} />
        </div>
        <aside className="w-72 flex-shrink-0 hidden lg:block">
          <RankingSidebar results={results} />
        </aside>
      </div>
    </div>
  )
}
