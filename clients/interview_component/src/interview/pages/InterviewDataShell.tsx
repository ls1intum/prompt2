import { useParams } from 'react-router-dom'
import { useParticipationStore } from '../zustand/useParticipationStore'
import { useEffect } from 'react'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { ErrorPage } from '@/components/ErrorPage'
import {
  CoursePhaseWithMetaData,
  CoursePhaseParticipationsWithResolution,
} from '@tumaet/prompt-shared-state'
import { getCoursePhase } from '@/network/queries/getCoursePhase'
import { useCoursePhaseStore } from '../zustand/useCoursePhaseStore'
import { InterviewSlot } from '../interfaces/InterviewSlots'

interface InterviewDataShellProps {
  children: React.ReactNode
}

export const InterviewDataShell = ({ children }: InterviewDataShellProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { setParticipations, setInterviewSlots } = useParticipationStore()
  const { setCoursePhase } = useCoursePhaseStore()
  const {
    data: coursePhaseParticipations,
    isPending: isCoursePhaseParticipationsPending,
    isError: isParticipationsError,
    refetch: refetchCoursePhaseParticipations,
  } = useQuery<CoursePhaseParticipationsWithResolution>({
    queryKey: ['participants', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })

  const {
    data: coursePhase,
    isPending: isCoursePhasePending,
    isError: isCoursePhaseError,
    refetch: refetchCoursePhase,
  } = useQuery<CoursePhaseWithMetaData>({
    queryKey: ['course_phase', phaseId],
    queryFn: () => getCoursePhase(phaseId ?? ''),
  })

  const isError = isParticipationsError || isCoursePhaseError
  const isPending = isCoursePhaseParticipationsPending || isCoursePhasePending
  const refetch = () => {
    refetchCoursePhaseParticipations()
    refetchCoursePhase()
  }

  useEffect(() => {
    if (coursePhaseParticipations) {
      setParticipations(coursePhaseParticipations.participations)
    }
  }, [coursePhaseParticipations, setParticipations])

  useEffect(() => {
    if (coursePhase) {
      setCoursePhase(coursePhase)

      const interviewSlots =
        ((coursePhase?.restrictedData?.interviewSlots as InterviewSlot[]) ?? []).map(
          (slot, index) => {
            return { ...slot, index: index + 1 }
          },
        ) ?? []
      setInterviewSlots(interviewSlots)
    }
  }, [coursePhase, setCoursePhase, setInterviewSlots])

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
