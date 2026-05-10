import { notFound } from 'next/navigation'
import { GradeMenu }          from '@/components/navigation/GradeMenu'
import { SubjectTabs }        from '@/components/navigation/SubjectTabs'
import { LessonList }         from '@/components/navigation/LessonList'
import { SidebarNavigation }  from '@/components/navigation/SidebarNavigation'
import { getGrades, getGradeBySlug } from '@/lib/services/grades'
import { getSubjectsByGrade, getSubjects } from '@/lib/services/subjects'
import { getLessonsByGrade }  from '@/lib/services/lessons'

interface Props {
  params: Promise<{ gradeSlug: string }>
}

export default async function GradePage({ params }: Props) {
  const { gradeSlug } = await params
  const [grade, grades, allSubjects] = await Promise.all([
    getGradeBySlug(gradeSlug),
    getGrades(),
    getSubjects(),
  ])

  if (!grade) notFound()

  const [subjects, lessons] = await Promise.all([
    getSubjectsByGrade(grade.id),
    getLessonsByGrade(grade.id),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{grade.name}</h1>
        <p className="text-gray-500 text-sm">{lessons.length} bài học · {subjects.length} môn học</p>
      </div>

      <GradeMenu grades={grades} />

      <div className="flex gap-6 mt-6">
        <SidebarNavigation
          grades={grades}
          subjects={subjects}
          currentGradeSlug={gradeSlug}
        />
        <div className="flex-1 min-w-0">
          {subjects.length > 0 && (
            <div className="mb-5">
              <SubjectTabs grade={grade} subjects={subjects} />
            </div>
          )}
          <LessonList lessons={lessons} />
        </div>
      </div>
    </div>
  )
}
