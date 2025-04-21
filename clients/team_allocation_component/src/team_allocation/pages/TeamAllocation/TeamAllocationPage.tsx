import type React from 'react'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Users, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

import type { CoursePhaseParticipationsWithResolution, Student } from '@tumaet/prompt-shared-state'
import type { Team } from '../../interfaces/team'
import type { Allocation } from '../../interfaces/allocation'

import { getAllTeams } from '../../network/queries/getAllTeams'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { getTeamAllocations } from '../../network/queries/getTeamAllocations'

import { ErrorPage } from '@/components/ErrorPage'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

/**
 * Page that displays the allocated teams for a course phase together with their members.
 */
export const TeamAllocationPage: React.FC = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  /**
   * --- Data Fetching -------------------------------------------------------
   */
  const {
    data: fetchedTeams,
    isPending: isTeamsPending,
    isError: isTeamsError,
    refetch: refetchTeams,
  } = useQuery<Team[]>({
    queryKey: ['team_allocation_team', phaseId],
    queryFn: () => getAllTeams(phaseId ?? ''),
  })

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
    data: teamAllocations,
    isPending: isTeamAllocationsPending,
    isError: isTeamAllocationsError,
    refetch: refetchTeamAllocations,
  } = useQuery<Allocation[]>({
    queryKey: ['team_allocations', phaseId],
    queryFn: () => getTeamAllocations(phaseId ?? ''),
  })

  /**
   * --- Derived Data --------------------------------------------------------
   * Build a map <courseParticipationID, Student> so we can resolve names fast.
   */
  const participationMap = useMemo(() => {
    const map = new Map<string, Student>()
    coursePhaseParticipations?.participations.forEach((p) => {
      map.set(p.courseParticipationID, p.student)
    })
    return map
  }, [coursePhaseParticipations])

  /**
   * Combine team, allocation and participations into a render‑friendly shape.
   */
  const teamsWithMembers = useMemo(() => {
    if (!fetchedTeams) return []

    return fetchedTeams.map((team) => {
      const allocation = teamAllocations?.find((a) => a.projectId === team.id)
      const members = allocation
        ? (allocation.students
            .map((cpId) => participationMap.get(cpId))
            .filter(Boolean) as Student[])
        : []

      return {
        id: team.id,
        name: team.name,
        members,
      }
    })
  }, [fetchedTeams, teamAllocations, participationMap])

  /**
   * Calculate allocation statistics
   */
  const allocationStats = useMemo(() => {
    if (!coursePhaseParticipations || !teamAllocations) {
      return {
        totalStudents: 0,
        assignedStudents: 0,
        unassignedStudents: 0,
        isComplete: false,
        percentComplete: 0,
      }
    }

    const totalStudents = coursePhaseParticipations.participations.length

    // Get all assigned student IDs from all allocations
    const assignedStudentIds = new Set<string>()
    teamAllocations.forEach((allocation) => {
      allocation.students.forEach((studentId) => {
        assignedStudentIds.add(studentId)
      })
    })

    const assignedStudents = assignedStudentIds.size
    const unassignedStudents = totalStudents - assignedStudents
    const isComplete = unassignedStudents === 0 && totalStudents > 0
    const percentComplete = totalStudents > 0 ? (assignedStudents / totalStudents) * 100 : 0

    return {
      totalStudents,
      assignedStudents,
      unassignedStudents,
      isComplete,
      percentComplete,
    }
  }, [coursePhaseParticipations, teamAllocations])

  /**
   * --- Aggregate Request States -------------------------------------------
   */
  const isPending = isTeamsPending || isCoursePhaseParticipationsPending || isTeamAllocationsPending

  const isError = isTeamsError || isParticipationsError || isTeamAllocationsError

  /**
   * --- UI ------------------------------------------------------------------
   */
  if (isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorPage
        onRetry={() => {
          refetchTeams()
          refetchCoursePhaseParticipations()
          refetchTeamAllocations()
        }}
      />
    )
  }

  return (
    <div className='space-y-6'>
      <ManagementPageHeader>Team Allocations</ManagementPageHeader>

      {/* Allocation Summary Card */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-medium'>Allocation Status</h3>
            {allocationStats.isComplete ? (
              <Badge className='bg-green-500 hover:bg-green-600'>
                <CheckCircle2 className='h-3.5 w-3.5 mr-1' />
                Complete
              </Badge>
            ) : (
              <Badge variant='outline' className='border-amber-500 text-amber-500'>
                <AlertCircle className='h-3.5 w-3.5 mr-1' />
                In Progress
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className='pb-4'>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='bg-muted/40 rounded-lg p-4 flex flex-col items-center justify-center text-center'>
              <div className='rounded-full bg-background p-2 mb-2'>
                <Users className='h-5 w-5 text-primary' />
              </div>
              <p className='text-2xl font-bold'>{allocationStats.totalStudents}</p>
              <p className='text-sm text-muted-foreground'>Total Students</p>
            </div>

            <div className='bg-green-50 dark:bg-green-900 rounded-lg p-4 flex flex-col items-center justify-center text-center'>
              <div className='rounded-full bg-green-100 dark:bg-green-900 p-2 mb-2'>
                <CheckCircle2 className='h-5 w-5 text-green-600 dark:text-green-400' />
              </div>
              <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                {allocationStats.assignedStudents}
              </p>
              <p className='text-sm text-green-600/80 dark:text-green-400/80'>Assigned</p>
            </div>

            <div className='bg-red-50 dark:bg-red-800 rounded-lg p-4 flex flex-col items-center justify-center text-center'>
              <div className='rounded-full bg-red-100 dark:bg-amber-900/30 p-2 mb-2'>
                <AlertCircle className='h-5 w-5 text-red-600 dark:text-amber-400' />
              </div>
              <p className='text-2xl font-bold text-red-600'>
                {allocationStats.unassignedStudents}
              </p>
              <p className='text-sm'>Unassigned</p>
            </div>
          </div>
        </CardContent>
        <CardContent className='pt-0 pb-4 flex justify-end'>
          {/* Replace with the correct path for your app */}
          <Button asChild>
            <Link to={`/phases/${phaseId}/tease`}>
              Go to Tease
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {teamsWithMembers.length === 0 ? (
        <Card className='bg-muted/40'>
          <CardContent className='pt-6 flex flex-col items-center justify-center text-center p-8'>
            <div className='rounded-full bg-muted p-3 mb-4'>
              <Users className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium mb-2'>No Teams Allocated Yet</h3>
            <p className='text-muted-foreground mb-4'>
              Start by creating teams and allocating students to them.
            </p>
            {/* Replace with the correct path for your app */}
            <Button asChild>
              <Link to={`/phases/${phaseId}/tease`}>
                Go to Tease
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {teamsWithMembers.map((team) => (
              <Card
                key={team.id}
                className='overflow-hidden border-l-4 hover:shadow-md transition-shadow duration-200'
              >
                <CardHeader className='pb-2'>
                  <div className='flex justify-between items-center'>
                    <h3 className='text-lg font-semibold tracking-tight'>{team.name}</h3>
                    <Badge variant='outline' className='ml-2'>
                      <Users className='h-3.5 w-3.5 mr-1' />
                      {team.members.length}
                    </Badge>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className='pt-4'>
                  {team.members.length === 0 ? (
                    <p className='text-sm italic text-muted-foreground'>
                      No members allocated yet.
                    </p>
                  ) : (
                    <ul className='space-y-2'>
                      {team.members.map((member) => (
                        <li key={member.id} className='text-sm flex items-center gap-2'>
                          <div className='h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium'>
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </div>
                          <span>
                            {member.firstName} {member.lastName}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
