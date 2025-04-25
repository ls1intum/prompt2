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

  const extraData: ExtraParticipationTableData[] | undefined = useMemo(() => {
    if (!teams) return undefined
    return teams
      .map((team) =>
        team.members.map((member) => ({
          courseParticipationID: member.courseParticipationID,
          value: team.name,
          stringValue: team.name,
        })),
      )
      .flat()
  }, [teams])

  const refetch = () => {
    refetchCoursePhaseParticipations()
    refetchTeams()
  }

  const isError = isParticipationsError || isTeamsError
  const isPending = isCoursePhaseParticipationsPending || isTeamsPending

  if (isError) return <ErrorPage onRetry={refetch} description='Could not fetch scoreLevels' />
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
        Click on a participant to view/edit their assessment.
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
