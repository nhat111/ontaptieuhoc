import { ExamEditor } from '@/components/teacher/ExamEditor'
import { getGrades }  from '@/lib/services/grades'
import { getSubjects } from '@/lib/services/subjects'

export const metadata = { title: 'Tạo bài kiểm tra — ÔnTập' }

export default async function CreateExamPage() {
  const [grades, subjects] = await Promise.all([getGrades(), getSubjects()])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-gray-500 mb-1">Giáo viên / Tạo nội dung</p>
          <h1 className="text-xl font-bold text-gray-900">Bảng điều khiển giáo viên</h1>
        </div>
      </div>
      <ExamEditor grades={grades} subjects={subjects} />
    </div>
  )
}
