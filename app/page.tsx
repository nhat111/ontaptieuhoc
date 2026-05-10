import { HeroSection }      from '@/components/home/HeroSection'
import { GradeCards }       from '@/components/home/GradeCards'
import { PopularSubjects }  from '@/components/home/PopularSubjects'
import { FeaturedLessons }  from '@/components/home/FeaturedLessons'
import { Statistics }       from '@/components/home/Statistics'
import { CTASection }       from '@/components/home/CTASection'
import { getGrades }        from '@/lib/services/grades'
import { getSubjects }      from '@/lib/services/subjects'
import { getFeaturedLessons } from '@/lib/services/lessons'

export default async function HomePage() {
  const [grades, subjects, lessons] = await Promise.all([
    getGrades(),
    getSubjects(),
    getFeaturedLessons(6),
  ])

  return (
    <>
      <HeroSection     grades={grades}   />
      <GradeCards      grades={grades}   />
      <Statistics                        />
      <PopularSubjects subjects={subjects} />
      <FeaturedLessons lessons={lessons} />
      <CTASection                        />
    </>
  )
}
