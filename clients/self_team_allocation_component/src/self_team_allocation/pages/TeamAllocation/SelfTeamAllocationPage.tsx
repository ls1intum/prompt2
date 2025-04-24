import { useCourseStore } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import UnauthorizedPage from '@/components/UnauthorizedPage'
import { ErrorPage } from '@/components/ErrorPage'
import { getOwnCoursePhaseParticipation } from '@/network/queries/getOwnCoursePhaseParticipation'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

import { TeamSelection } from './components/TeamSelection'
import { getAllTeams } from '../../network/queries/getAllTeams'
import { Team } from '../../interfaces/team'
import { Timeframe } from 'src/self_team_allocation/interfaces/timeframe'

export const SelfTeamAllocationPage = (): JSX.Element => {
  const { isStudentOfCourse } = useCourseStore()
  const { courseId = '', phaseId = '' } = useParams<{ courseId: string; phaseId: string }>()
  const isStudent = isStudentOfCourse(courseId)

  const {
    data: participation,
    isPending: isParticipationsPending,
    isError: isParticipationsError,
    refetch: refetchCoursePhaseParticipations,
    error: participationError,
  } = useQuery<CoursePhaseParticipationWithStudent>({
    queryKey: ['course_phase_participation', phaseId],
    queryFn: () => getOwnCoursePhaseParticipation(phaseId),
    enabled: isStudent,
  })

  const {
    data: teams,
    isPending: isTeamsPending,
    isError: isTeamsError,
    refetch: refetchTeams,
  } = useQuery<Team[]>({
    queryKey: ['self_team_allocations', phaseId],
    queryFn: () => getAllTeams(phaseId),
  })

  const isError = isParticipationsError || isTeamsError
  const isPending = isParticipationsPending || isTeamsPending
  const refetch = () => {
    refetchCoursePhaseParticipations()
    refetchTeams()
  }

  if (isTeamsPending || (isStudent && isPending)) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (isStudent && isError) {
    if (participationError && participationError.message.includes('404')) {
      return <UnauthorizedPage backUrl={`/management/course/${courseId}`} />
    }
    return <ErrorPage onRetry={refetch} />
  }

  const cpId = participation?.courseParticipationID

  const mockTimeframe: Timeframe = {
    timeframeSet: true,
    startTime: new Date('2023-10-01T00:00:00Z'),
    endTime: new Date('2023-12-31T23:59:59Z'),
  }

  return (
    <>
      {!isStudent && (
        <Alert>
          <TriangleAlert className='h-4 w-4' />
          <AlertTitle>You are not a student of this course.</AlertTitle>
          <AlertDescription>
            The team-allocation UI is disabled because you’re not enrolled.
          </AlertDescription>
        </Alert>
      )}

      {teams && (
        <TeamSelection
          teams={teams}
          courseParticipationID={cpId}
          refetchTeams={refetchTeams}
          timeframe={mockTimeframe}
        />
      )}
    </>
  )
}
