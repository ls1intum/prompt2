import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCoursePhaseParticipations } from './network/queries/getCoursePhaseParticipations'
import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { useEffect } from 'react'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { Loader2 } from 'lucide-react'
import { StudentCard } from './components/StudentCard'

export const OverviewPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: coursePhaseParticipations,
    isPending,
    isError,
    error,
  } = useQuery<CoursePhaseParticipationWithStudent[]>({
    queryKey: ['participants', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })

  useEffect(() => {
    if (coursePhaseParticipations) {
      console.log(coursePhaseParticipations)
    }
  }, [coursePhaseParticipations])

  return (
    <div>
      <ManagementPageHeader>Interview</ManagementPageHeader>
      {isPending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
          {coursePhaseParticipations?.map((participation) => (
            <StudentCard key={participation.student.last_name} participation={participation} />
          ))}
        </div>
      )}
    </div>
  )
}

export default OverviewPage
