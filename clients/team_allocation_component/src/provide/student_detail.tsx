import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Team, CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { Allocation } from '../team_allocation/interfaces/allocation'
import { getAllTeams } from '../team_allocation/network/queries/getAllTeams'
import { getTeamAllocations } from '../team_allocation/network/queries/getTeamAllocations'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'

export interface CoursePhaseStudentIdentifierProps {
  studentId: string
  coursePhaseId: string
  courseId: string
}

export const StudentDetail: React.FC<CoursePhaseStudentIdentifierProps> = ({
  studentId,
  coursePhaseId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  courseId: _courseId,
}) => {
  const { data: teams, isPending: isTeamsPending } = useQuery<Team[]>({
    queryKey: ['team_allocation_team', coursePhaseId],
    queryFn: () => getAllTeams(coursePhaseId),
  })

  const { data: coursePhaseParticipations, isPending: isParticipationsPending } =
    useQuery<CoursePhaseParticipationsWithResolution>({
      queryKey: ['participants', coursePhaseId],
      queryFn: () => getCoursePhaseParticipations(coursePhaseId),
    })

  const { data: teamAllocations, isPending: isAllocationsPending } = useQuery<Allocation[]>({
    queryKey: ['team_allocations', coursePhaseId],
    queryFn: () => getTeamAllocations(coursePhaseId),
  })

  const studentTeam = useMemo(() => {
    if (!coursePhaseParticipations || !teamAllocations || !teams) {
      return null
    }

    // Find the course participation ID for this student
    const participation = coursePhaseParticipations.participations.find(
      (p) => p.student?.id === studentId,
    )

    if (!participation) {
      return null
    }

    const courseParticipationID = participation.courseParticipationID

    // Find the allocation that contains this course participation ID
    const allocation = teamAllocations.find((a) => a.students.includes(courseParticipationID))

    if (!allocation) {
      return null
    }

    // Find the team for this allocation
    const team = teams.find((t) => t.id === allocation.projectId)

    return team || null
  }, [coursePhaseParticipations, teamAllocations, teams, studentId])

  const isPending = isTeamsPending || isAllocationsPending || isParticipationsPending

  if (isPending) {
    return null
  }

  if (!studentTeam) {
    return null
  }

  return (
    <div className='text-sm'>
      <span className='text-muted-foreground'>Team: </span>
      <span className='font-medium'>{studentTeam.name}</span>
    </div>
  )
}
