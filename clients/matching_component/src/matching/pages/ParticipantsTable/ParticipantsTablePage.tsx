import { ErrorPage } from '@/components/ErrorPage'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { useQuery } from '@tanstack/react-query'
import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export const ParticipantsTablePage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const [prevDataKeys, setPrevDataKeys] = useState<string[]>([])

  const {
    data: coursePhaseParticipations,
    isPending: isCoursePhaseParticipationsPending,
    isError: isParticipationsError,
    refetch: refetchCoursePhaseParticipations,
  } = useQuery<CoursePhaseParticipationsWithResolution>({
    queryKey: ['participants', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })

  useEffect(() => {
    if (coursePhaseParticipations && Array.isArray(coursePhaseParticipations)) {
      const containsInterview = coursePhaseParticipations.some((participation) => {
        return participation?.prevData?.interviewScore !== undefined
      })
      const containsApplicationScore = coursePhaseParticipations.some((participation) => {
        return participation?.prevData?.applicationScore !== undefined
      })

      const dataKeys: string[] = []
      if (containsInterview) {
        dataKeys.push('interviewScore')
      }
      if (containsApplicationScore) {
        dataKeys.push('applicationScore')
      }
      setPrevDataKeys(dataKeys)
    }
  }, [coursePhaseParticipations])

  return (
    <div>
      <ManagementPageHeader>Course Phase Participants</ManagementPageHeader>
      {isParticipationsError ? (
        <ErrorPage onRetry={refetchCoursePhaseParticipations} />
      ) : isCoursePhaseParticipationsPending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <CoursePhaseParticipationsTablePage
          participants={coursePhaseParticipations.participations ?? []}
          prevDataKeys={prevDataKeys}
          restrictedDataKeys={[]}
          studentReadableDataKeys={[]}
        />
      )}
    </div>
  )
}
