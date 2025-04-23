import { useCourseStore } from '@tumaet/prompt-shared-state'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import UnauthorizedPage from '@/components/UnauthorizedPage'
import { ErrorPage } from '@/components/ErrorPage'
import { getOwnCoursePhaseParticipation } from '@/network/queries/getOwnCoursePhaseParticipation'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

import { Team } from '../../interfaces/team'
import { TeamAllocation as Allocation } from '../../interfaces/teamAllocation'
import { TeamSelection } from './components/TeamSelection'
import { useState } from 'react'

// 1) Mock teams (no members here!)
const INITIAL_TEAMS: Team[] = [
  { id: '1', name: 'Team Alpha' },
  { id: '2', name: 'Team Beta' },
  { id: '3', name: 'Team Gamma' },
]

// 2) Mock allocations (normally loaded from your “getAllTeamAllocations” endpoint)
const INITIAL_ALLOCATIONS: Allocation[] = [
  { projectId: '1', studentName: 'Alice A.', courseParticipationID: 'cp-101' },
  { projectId: '2', studentName: 'Bob B.', courseParticipationID: 'cp-102' },
  { projectId: '1', studentName: 'Carol C.', courseParticipationID: 'cp-103' },
]

export const SelfTeamAllocationPage = (): JSX.Element => {
  const { isStudentOfCourse } = useCourseStore()
  const { courseId = '', phaseId = '' } = useParams<{ courseId: string; phaseId: string }>()
  const isStudent = isStudentOfCourse(courseId)

  const {
    data: participation,
    error,
    isPending,
    isError,
    refetch,
  } = useQuery<CoursePhaseParticipationWithStudent>({
    queryKey: ['course_phase_participation', phaseId],
    queryFn: () => getOwnCoursePhaseParticipation(phaseId),
    enabled: isStudent,
  })

  // local state for allocations
  const [allocations, setAllocations] = useState<Allocation[]>(INITIAL_ALLOCATIONS)
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS)

  if (isStudent && isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (isStudent && isError) {
    if (error.message.includes('404')) {
      return <UnauthorizedPage backUrl={`/management/course/${courseId}`} />
    }
    return <ErrorPage onRetry={refetch} />
  }

  const studentName = `${participation?.student.firstName} ${participation?.student.lastName}`
  const cpId = participation?.courseParticipationID

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

      <TeamSelection
        teams={teams}
        setTeams={setTeams}
        allocations={allocations}
        setAllocations={setAllocations}
        studentName={studentName}
        courseParticipationID={cpId}
      />
    </>
  )
}
