import { ManagementPageHeader, ErrorPage } from '@tumaet/prompt-ui-components'
import { getCoursePhaseParticipations } from '@/network/queries/getCoursePhaseParticipations'
import { useQuery } from '@tanstack/react-query'
import { CoursePhaseParticipationsWithResolution } from '@tumaet/prompt-shared-state'
import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'
import { Team } from '../../interfaces/team'
import { getAllTeams } from '../../network/queries/getAllTeams'
import { useMemo } from 'react'
import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/ExtraParticipationTableColumn'

export const SelfTeamAllocationParticipantsPage = (): JSX.Element => {
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
    queryKey: ['self_team_allocations', phaseId],
    queryFn: () => getAllTeams(phaseId ?? ''),
  })

  const extraColumns: ExtraParticipationTableColumn[] = useMemo(() => {
    if (!teams) return []

    // Build a quick lookup so we don’t do an O(n²) “find” in the loop.
    const teamNameById = new Map(teams.map(({ id, name }) => [id, name]))

    const teamNameExtraData = teams.flatMap(({ id, members }) => {
      const teamName = teamNameById.get(id) ?? 'No Team'

      return members.map((member) => ({
        courseParticipationID: member.courseParticipationID,
        value: teamName,
        stringValue: teamName,
      }))
    })

    return [
      {
        id: 'allocatedTeam',
        header: 'Allocated Team',
        extraData: teamNameExtraData,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = rowA.getValue('allocatedTeam') as string
          const b = rowB.getValue('allocatedTeam') as string
          return a.localeCompare(b)
        },
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValue) => {
          const value = String(row.getValue(columnId) ?? '').toLowerCase()
          if (!Array.isArray(filterValue)) return false
          return filterValue.map((v) => v.toLowerCase()).includes(value)
        },
      },
    ]
  }, [teams])

  const refetch = () => {
    refetchCoursePhaseParticipations()
    refetchTeams()
  }

  const isError = isParticipationsError || isTeamsError
  const isPending = isCoursePhaseParticipationsPending || isTeamsPending

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
      <ManagementPageHeader>Self Team Allocation Participants</ManagementPageHeader>
      <p className='text-sm text-muted-foreground mb-4'>
        This table shows all participants and their allocated teams.
      </p>
      <div className='w-full'>
        <CoursePhaseParticipationsTablePage
          participants={coursePhaseParticipations.participations ?? []}
          prevDataKeys={[]}
          restrictedDataKeys={[]}
          studentReadableDataKeys={[]}
          extraColumns={extraColumns}
        />
      </div>
    </div>
  )
}
