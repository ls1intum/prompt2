import { ErrorPage } from '@/components/ErrorPage'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { useCustomElementWidth } from '@/hooks/useCustomElementWidth'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { useQuery } from '@tanstack/react-query'
import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'
import { Team } from '../../interfaces/team'
import { getAllTeams } from '../../network/queries/getAllTeams'
import { useMemo } from 'react'
import { ExtraParticipationTableData } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/ExtraParticipationTableData'
import { getTeamAllocations } from '../../network/queries/getTeamAllocations'
import { Allocation } from '../../interfaces/allocation'

export const ParticipantsPage = (): JSX.Element => {
  const tableWidth = useCustomElementWidth('table-view')
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

  const {
    data: teams,
    isPending: isTeamsPending,
    isError: isTeamsError,
    refetch: refetchTeams,
  } = useQuery<Team[]>({
    queryKey: ['team_allocation_team', phaseId],
    queryFn: () => getAllTeams(phaseId ?? ''),
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

  const extraData: ExtraParticipationTableData[] | undefined = useMemo<
    ExtraParticipationTableData[]
  >(() => {
    if (!teams || !teamAllocations) return []

    // Build a quick lookup so we don’t do an O(n²) “find” in the loop.
    const teamNameById = new Map(teams.map(({ id, name }) => [id, name]))

    return teamAllocations.flatMap(({ projectId, students }) => {
      const teamName = teamNameById.get(projectId) ?? 'No Team'

      return students.map((courseParticipationID) => ({
        courseParticipationID,
        value: teamName,
        stringValue: teamName,
      }))
    })
  }, [teams, teamAllocations])

  const refetch = () => {
    refetchCoursePhaseParticipations()
    refetchTeams()
    refetchTeamAllocations()
  }

  const isError = isParticipationsError || isTeamsError || isTeamAllocationsError
  const isPending = isCoursePhaseParticipationsPending || isTeamsPending || isTeamAllocationsPending

  if (isError)
    return <ErrorPage onRetry={refetch} description='Could not fetch participants or teams' />
  if (isPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  return (
    <div id='table-view' className='relative flex flex-col'>
      <ManagementPageHeader>Team Allocation Participants</ManagementPageHeader>
      <p className='text-sm text-muted-foreground mb-4'>
        This table shows all participants and their allocated teams.
      </p>
      <div style={{ width: `${tableWidth}px` }}>
        <CoursePhaseParticipationsTablePage
          participants={coursePhaseParticipations.participations ?? []}
          prevDataKeys={[]}
          extraColumnHeader='Allocated Team'
          extraData={extraData}
          restrictedDataKeys={[]}
          studentReadableDataKeys={[]}
        />
      </div>
    </div>
  )
}
