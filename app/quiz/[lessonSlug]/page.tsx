import { notFound } from 'next/navigation'
import { QuizClient }          from '@/components/quiz/QuizClient'
import { getLessonBySlug }     from '@/lib/services/lessons'
import { getQuestionsByLesson } from '@/lib/services/questions'

interface Props {
  params: Promise<{ lessonSlug: string }>
}

export default async function QuizPage({ params }: Props) {
  const { lessonSlug } = await params
  const lesson = await getLessonBySlug(lessonSlug)
  if (!lesson) notFound()

  const questions = await getQuestionsByLesson(lesson.id)

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <QuizClient lesson={lesson} questions={questions} />
    </div>
  )
}
