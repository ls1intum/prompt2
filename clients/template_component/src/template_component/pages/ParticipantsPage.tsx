import { ErrorPage, ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { useQuery } from '@tanstack/react-query'
import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'

export const TemplateComponentParticipantsPage = (): JSX.Element => {
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

  const refetch = () => {
    refetchCoursePhaseParticipations()
  }

  const isError = isParticipationsError
  const isPending = isCoursePhaseParticipationsPending

  if (isError) return <ErrorPage onRetry={refetch} description='Could not fetch participants' />
  if (isPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  return (
    <div id='table-view' className='relative flex flex-col'>
      <ManagementPageHeader>Template Component Participants</ManagementPageHeader>
      <p className='text-sm text-muted-foreground mb-4'>
        This table shows all participants of the Template Component phase.
      </p>
      <div className='w-full'>
        <CoursePhaseParticipationsTablePage
          participants={coursePhaseParticipations.participations ?? []}
          prevDataKeys={[]}
          restrictedDataKeys={[]}
          studentReadableDataKeys={[]}
        />
      </div>
    </div>
  )
}
