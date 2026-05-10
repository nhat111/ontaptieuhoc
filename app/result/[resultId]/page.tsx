import { notFound } from 'next/navigation'
import { ResultSummary } from '@/components/result/ResultSummary'
import { ResultItem }    from '@/components/result/ResultItem'
import { getResultById } from '@/lib/services/results'
import { getQuestionsByLesson } from '@/lib/services/questions'

interface Props {
  params: Promise<{ resultId: string }>
}

export default async function ResultPage({ params }: Props) {
  const { resultId } = await params
  const result = await getResultById(resultId)
  if (!result) notFound()

  const questions = await getQuestionsByLesson(result.lesson_id)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kết quả làm bài</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div>
          <ResultSummary result={result} />
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-gray-800">Chi tiết từng câu</h2>
          {questions.map((q, i) => {
            const record = result.answers.find(a => a.question_id === q.id) ?? {
              question_id: q.id,
              selected: [],
              is_correct: false,
            }
            return <ResultItem key={q.id} question={q} record={record} index={i} />
          })}
        </div>
      </div>
    </div>
  )
}
