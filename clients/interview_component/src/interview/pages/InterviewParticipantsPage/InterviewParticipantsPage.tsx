import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { ErrorPage, ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { CoursePhaseParticipationsTable } from '@/components/pages/CoursePhaseParticipationsTable/CoursePhaseParticipationsTable'

export const InterviewParticipantsPage = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: coursePhaseParticipations,
    isPending: isCoursePhaseParticipationsPending,
    isError: isParticipationsError,
    refetch: refetchCoursePhaseParticipations,
  } = useQuery<CoursePhaseParticipationsWithResolution>({
    queryKey: ['participants', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })

  return (
    <div>
      <ManagementPageHeader>Interview Participants</ManagementPageHeader>
      {isParticipationsError ? (
        <ErrorPage onRetry={refetchCoursePhaseParticipations} />
      ) : isCoursePhaseParticipationsPending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <CoursePhaseParticipationsTable
          phaseId={phaseId!}
          participants={coursePhaseParticipations.participations ?? []}
        />
      )}
    </div>
  )
}
