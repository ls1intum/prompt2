import { Loader2 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'
import { useGetAllScoreLevels } from './hooks/useGetAllScoreLevels'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { ErrorPage } from '@/components/ErrorPage'
import StudentScoreBadge from '../components/StudentScoreBadge'
import { useCustomElementWidth } from '@/hooks/useCustomElementWidth'

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

  const extraData = scoreLevels?.map((scoreLevelWithParticipation) => ({
    courseParticipationID: scoreLevelWithParticipation.courseParticipationID,
    value: <StudentScoreBadge scoreLevel={scoreLevelWithParticipation.scoreLevel} />,
  }))

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
          extraData={extraData}
          extraColumnHeader='ScoreLevel'
          restrictedDataKeys={[]}
          studentReadableDataKeys={[]}
          onClickRowAction={(student) =>
            navigate(`${path}/student-assessment/${student.courseParticipationID}`)
          }
        />
      </div>
    </div>
  )
}
