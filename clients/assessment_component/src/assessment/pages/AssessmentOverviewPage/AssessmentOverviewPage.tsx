import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'

import { StudentScoreBadge } from '../components/StudentScoreBadge'

import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/ExtraParticipationTableColumn'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useScoreLevelStore } from '../../zustand/useScoreLevelStore'

import { mapScoreLevelToNumber, ScoreLevel } from '../../interfaces/scoreLevel'

import { AssessmentDiagram } from '../components/diagrams/AssessmentDiagram'
import { AssessmentScoreLevelDiagram } from '../components/diagrams/AssessmentScoreLevelDiagram'

export const AssessmentOverviewPage = (): JSX.Element => {
  const navigate = useNavigate()
  const path = useLocation().pathname

  const { participations } = useParticipationStore()
  const { scoreLevels } = useScoreLevelStore()

  const extraColumns: ExtraParticipationTableColumn[] = useMemo(() => {
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
        sortingFn: (rowA, rowB) => {
          const scoreA = mapScoreLevelToNumber(
            scoreLevels.find((s) => s.courseParticipationID === rowA.original.courseParticipationID)
              ?.scoreLevel ?? ScoreLevel.VeryBad,
          )
          const scoreB = mapScoreLevelToNumber(
            scoreLevels.find((s) => s.courseParticipationID === rowB.original.courseParticipationID)
              ?.scoreLevel ?? ScoreLevel.VeryBad,
          )
          return scoreA && scoreB ? scoreA - scoreB : 0
        },
        extraData: scoreLevels.map((s) => ({
          courseParticipationID: s.courseParticipationID,
          value: <StudentScoreBadge scoreLevel={s.scoreLevel} />,
          stringValue: s.scoreLevel,
        })),
      },
    ]
  }, [scoreLevels])

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
      <div className='w-full'>
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
