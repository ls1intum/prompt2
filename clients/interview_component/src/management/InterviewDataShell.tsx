import { CoursePhaseParticipationWithStudent } from '@/interfaces/course_phase_participation'
import { useParams } from 'react-router-dom'
import { useParticipationStore } from './zustand/useParticipationStore'
import { useEffect } from 'react'
import { getCoursePhaseParticipations } from './network/queries/getCoursePhaseParticipations'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { ErrorPage } from '@/components/ErrorPage'

interface InterviewDataShellProps {
  children: React.ReactNode
}

export const InterviewDataShell = ({ children }: InterviewDataShellProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { setParticipations } = useParticipationStore()
  const {
    data: coursePhaseParticipations,
    isPending,
    isError,
    refetch,
  } = useQuery<CoursePhaseParticipationWithStudent[]>({
    queryKey: ['participants', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })

  useEffect(() => {
    if (coursePhaseParticipations) {
      setParticipations(coursePhaseParticipations)
    }
  }, [coursePhaseParticipations, setParticipations])

  return (
    <>
      {isError ? (
        <ErrorPage onRetry={refetch} />
      ) : isPending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  )
}
