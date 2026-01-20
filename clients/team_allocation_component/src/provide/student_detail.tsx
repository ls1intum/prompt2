import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Team, CoursePhaseParticipationsWithResolution, Student } from '@tumaet/prompt-shared-state'
import { Allocation } from '../team_allocation/interfaces/allocation'
import { getAllTeams } from '../team_allocation/network/queries/getAllTeams'
import { getTeamAllocations } from '../team_allocation/network/queries/getTeamAllocations'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { RenderStudents } from '@/components/StudentAvatar'

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

  const studentTeamInfo = useMemo(() => {
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

    // Map course participation IDs to students
    const participationMap = new Map<string, Student>()
    coursePhaseParticipations.participations.forEach((p) => {
      participationMap.set(p.courseParticipationID, p.student)
    })

    // Find the allocation that contains this course participation ID
    const allocation = teamAllocations.find((a) => a.students.includes(courseParticipationID))

    if (!allocation) {
      return null
    }

    // Find the team for this allocation
    const team = teams.find((t) => t.id === allocation.projectId)

    if (!team) {
      return null
    }

    const members = allocation.students
      .map((cpId) => participationMap.get(cpId))
      .filter(Boolean) as Student[]

    const tutors = team.tutors ?? []

    return { team, members, tutors }
  }, [coursePhaseParticipations, teamAllocations, teams, studentId])

  const isPending = isTeamsPending || isAllocationsPending || isParticipationsPending

  if (isPending) {
    return null
  }

  if (!studentTeamInfo) {
    return null
  }

  const { team, members, tutors } = studentTeamInfo

  return (
    <div className='text-sm'>
      <h4 className='font-semibold text-lg'>{team.name}</h4>

      <RenderStudents
        students={tutors.map((tutor) => ({ ...tutor, email: 'no@mail.example' }))}
        fallback={<p className='text-xs italic text-muted-foreground'>No tutors allocated</p>}
      />

      <RenderStudents
        students={members}
        fallback={<p className='text-xs italic text-muted-foreground'>No members allocated.</p>}
      />
    </div>
  )
}
