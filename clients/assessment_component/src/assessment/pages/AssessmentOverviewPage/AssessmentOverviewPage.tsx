import { Loader2 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import {
  CoursePhaseParticipationsTablePage,
  ExtraParticipationColumn,
} from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'
import { useGetAllScoreLevels } from './hooks/useGetAllScoreLevels'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { ErrorPage } from '@/components/ErrorPage'
import StudentScoreBadge from '../components/StudentScoreBadge'
import { useCustomElementWidth } from '@/hooks/useCustomElementWidth'
import { useMemo } from 'react'

export const AssessmentOverviewPage = (): JSX.Element => {
  const navigate = useNavigate()
  const path = useLocation().pathname
  const tableWidth = useCustomElementWidth('table-view')

  const { participations } = useParticipationStore()

  const {
    data: scoreLevels,
    isPending: isScoreLevelsPending,
    isError: isScoreLevelsError,
    refetch: refetchScoreLevels,
  } = useGetAllScoreLevels()

  const refetch = () => {
    refetchScoreLevels()
  }

  const extraColumns: ExtraParticipationColumn[] = useMemo(() => {
    if (!scoreLevels) return []

    return [
      {
        id: 'scoreLevel',
        header: 'Score Level',
        accessorFn: (row) => {
          const match = scoreLevels.find(
            (s) => s.courseParticipationID === row.courseParticipationID,
          )
          return match ? <StudentScoreBadge scoreLevel={match.scoreLevel} /> : ''
        },
        enableSorting: true,
        extraData: scoreLevels.map((s) => ({
          courseParticipationID: s.courseParticipationID,
          value: <StudentScoreBadge scoreLevel={s.scoreLevel} />,
        })),
      },
    ]
  }, [scoreLevels])

  if (isScoreLevelsError)
    return <ErrorPage onRetry={refetch} description='Could not fetch scoreLevels' />
  if (isScoreLevelsPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  return (
    <div id='table-view' className='relative flex flex-col'>
      <ManagementPageHeader>Assessment Overview</ManagementPageHeader>
      <p className='text-sm text-muted-foreground mb-4'>
        Click on a participant to view/edit their assessment.
      </p>
      <div style={{ width: `${tableWidth}px` }}>
        <CoursePhaseParticipationsTablePage
          participants={participations ?? []}
          prevDataKeys={[]}
          restrictedDataKeys={[]}
          studentReadableDataKeys={[]}
          extraColumns={extraColumns}
          onClickRowAction={(student) =>
            navigate(`${path}/student-assessment/${student.courseParticipationID}`)
          }
          key={JSON.stringify(scoreLevels)}
        />
      </div>
    </div>
  )
}
