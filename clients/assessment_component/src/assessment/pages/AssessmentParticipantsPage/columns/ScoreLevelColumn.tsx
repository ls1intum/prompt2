import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/ExtraParticipationTableColumn'
import { StudentScoreBadge } from '../../components/badges'
import { mapScoreLevelToNumber, ScoreLevel } from '../../../interfaces/scoreLevel'
import { getLevelConfig } from '../../utils/getLevelConfig'
import { ScoreLevelWithParticipation } from '../../../interfaces/scoreLevelWithParticipation'

export const createScoreLevelColumn = (
  scoreLevels: ScoreLevelWithParticipation[],
): ExtraParticipationTableColumn => {
  return {
    id: 'scoreLevel',
    header: 'Score Level',
    accessorFn: (row) => {
      const match = scoreLevels.find((s) => s.courseParticipationID === row.courseParticipationID)
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
      return scoreA - scoreB
    },
    enableColumnFilter: true,
    extraData: scoreLevels.map((s) => ({
      courseParticipationID: s.courseParticipationID,
      value: <StudentScoreBadge scoreLevel={s.scoreLevel} showTooltip={true} />,
      stringValue: getLevelConfig(s.scoreLevel).title,
    })),
  }
}
