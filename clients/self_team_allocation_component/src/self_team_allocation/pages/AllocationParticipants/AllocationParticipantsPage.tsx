import {
  ManagementPageHeader,
  ErrorPage,
  useCustomElementWidth,
} from '@tumaet/prompt-ui-components'
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

export const AllocationParticipants = (): JSX.Element => {
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
    queryKey: ['self_team_allocations', phaseId],
    queryFn: () => getAllTeams(phaseId ?? ''),
  })

  const extraColumns = useMemo(() => {
    if (!teams) return []

    const data: ExtraParticipationTableData[] = teams.flatMap((team) =>
      team.members.map((member) => ({
        courseParticipationID: member.courseParticipationID,
        value: team.name,
        stringValue: team.name,
      })),
    )

    return [
      {
        id: 'allocatedTeam',
        header: 'Allocated Team',
        extraData: data,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = rowA.getValue('allocatedTeam') as string
          const b = rowB.getValue('allocatedTeam') as string
          return a.localeCompare(b)
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
      <ManagementPageHeader>Team Allocation Participants</ManagementPageHeader>
      <p className='text-sm text-muted-foreground mb-4'>
        This table shows all participants and their allocated teams.
      </p>
      <div style={{ width: `${tableWidth}px` }}>
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
