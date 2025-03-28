import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { CoursePhaseMailing } from '@/components/pages/Mailing/CoursePhaseMailing'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { ErrorPage } from '@/components/ErrorPage'
import { CoursePhaseWithMetaData } from '@tumaet/prompt-shared-state'
import { getCoursePhase } from '@/network/queries/getCoursePhase'

export const MailingPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: coursePhase,
    isPending: isCoursePhasePending,
    isError: isCoursePhaseError,
    refetch: refetchCoursePhase,
  } = useQuery<CoursePhaseWithMetaData>({
    queryKey: ['course_phase', phaseId],
    queryFn: () => getCoursePhase(phaseId ?? ''),
  })

  const refetch = () => {
    refetchCoursePhase()
  }

  return (
    <>
      {isCoursePhaseError ? (
        <ErrorPage onRetry={refetch} />
      ) : isCoursePhasePending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <>
          <div>
            <ManagementPageHeader>Mailing</ManagementPageHeader>
            <CoursePhaseMailing coursePhase={coursePhase} />
          </div>
        </>
      )}
    </>
  )
}
