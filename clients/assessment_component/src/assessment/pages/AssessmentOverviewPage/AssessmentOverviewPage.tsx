import { Loader2 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ErrorPage,
  ManagementPageHeader,
  useCustomElementWidth,
} from '@tumaet/prompt-ui-components'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'
import { useGetAllScoreLevels } from '../hooks/useGetAllScoreLevels'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { StudentScoreBadge } from '../components/StudentScoreBadge'
import { useMemo } from 'react'

import { AssessmentDiagram } from '../components/diagrams/AssessmentDiagram'
import { AssessmentScoreLevelDiagram } from '../components/diagrams/AssessmentScoreLevelDiagram'

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

  const extraData = useMemo(() => {
    return scoreLevels?.map((scoreLevelWithParticipation) => ({
      courseParticipationID: scoreLevelWithParticipation.courseParticipationID,
      value: <StudentScoreBadge scoreLevel={scoreLevelWithParticipation.scoreLevel} />,
    }))
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
      <div className='grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6'>
        <AssessmentDiagram participations={participations} scoreLevels={scoreLevels} />
        <AssessmentScoreLevelDiagram participations={participations} scoreLevels={scoreLevels} />
      </div>
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
          key={JSON.stringify(scoreLevels)}
        />
      </div>
    </div>
  )
}
