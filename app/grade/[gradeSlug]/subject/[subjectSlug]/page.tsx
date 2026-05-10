import { notFound } from 'next/navigation'
import { GradeMenu }          from '@/components/navigation/GradeMenu'
import { SubjectTabs }        from '@/components/navigation/SubjectTabs'
import { LessonList }         from '@/components/navigation/LessonList'
import { SidebarNavigation }  from '@/components/navigation/SidebarNavigation'
import { getGrades, getGradeBySlug } from '@/lib/services/grades'
import { getSubjectsByGrade, getSubjectBySlug } from '@/lib/services/subjects'
import { getLessonsBySubject } from '@/lib/services/lessons'

interface Props {
  params: Promise<{ gradeSlug: string; subjectSlug: string }>
}

export default async function SubjectPage({ params }: Props) {
  const { gradeSlug, subjectSlug } = await params

  const [grade, grades] = await Promise.all([
    getGradeBySlug(gradeSlug),
    getGrades(),
  ])
  if (!grade) notFound()

  const [subject, subjects] = await Promise.all([
    getSubjectBySlug(subjectSlug),
    getSubjectsByGrade(grade.id),
  ])
  if (!subject) notFound()

  const lessons = await getLessonsBySubject(grade.id, subject.id)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{subject.icon}</span>
          <h1 className="text-2xl font-bold text-gray-900">
            {subject.name} — {grade.name}
          </h1>
        </div>
        <p className="text-gray-500 text-sm">{lessons.length} bài học</p>
      </div>

      <GradeMenu grades={grades} />

      <div className="flex gap-6 mt-6">
        <SidebarNavigation
          grades={grades}
          subjects={subjects}
          currentGradeSlug={gradeSlug}
          currentSubjectSlug={subjectSlug}
        />
        <div className="flex-1 min-w-0">
          <div className="mb-5">
            <SubjectTabs grade={grade} subjects={subjects} activeSubjectSlug={subjectSlug} />
          </div>
          <LessonList lessons={lessons} />
        </div>
      </div>
    </div>
  )
}
