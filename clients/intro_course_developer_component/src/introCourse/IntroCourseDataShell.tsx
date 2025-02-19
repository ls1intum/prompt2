import { useCourseStore } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, TriangleAlert } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { getOwnCoursePhaseParticipation } from '@/network/queries/getOwnCoursePhaseParticipation'
import UnauthorizedPage from '@/components/UnauthorizedPage'
import { useEffect } from 'react'
import { useIntroCourseStore } from './zustand/useIntroCourseStore'

interface IntroCourseDataShellProps {
  children: React.ReactNode
}

export const IntroCourseDataShell = ({ children }: IntroCourseDataShellProps): JSX.Element => {
  const { isStudentOfCourse } = useCourseStore()
  const { courseId, phaseId } = useParams<{ courseId: string; phaseId: string }>()
  const isStudent = isStudentOfCourse(courseId ?? '')

  const { setCoursePhaseParticipation } = useIntroCourseStore()

  // getting the course phase participation
  const {
    data: fetchedParticipation,
    error,
    isPending,
    isError: isFetchingError,
  } = useQuery<CoursePhaseParticipationWithStudent>({
    queryKey: ['course_phase_participation', phaseId],
    queryFn: () => getOwnCoursePhaseParticipation(phaseId ?? ''),
  })

  useEffect(() => {
    if (fetchedParticipation) {
      setCoursePhaseParticipation(fetchedParticipation)
    }
  }, [fetchedParticipation, setCoursePhaseParticipation])

  // if he is not a student -> we do not wait for the participation
  if (isPending && isStudent) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (isFetchingError && isStudent) {
    // if the participation is not found, we show the unauthorized page bc then the student has not yet processed to this phase
    if (error.message.includes('404')) {
      return <UnauthorizedPage backUrl={`/management/course/${courseId}`} />
    }
  }

  return (
    <>
      {!isStudent && (
        <Alert>
          <TriangleAlert className='h-4 w-4' />
          <AlertTitle>Your are not a student of this course.</AlertTitle>
          <AlertDescription>
            The following components are disabled because you are not a student of this course. For
            configuring this view, please refer to the Intro Course in the Tutor Course.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  )
}
