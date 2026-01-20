import { AssessmentCompletion } from '../../../interfaces/assessmentCompletion'
import { ExtraParticipantColumn } from '@/components/pages/CoursePhaseParticipationsTable/table/participationRow'
import { GradeSuggestionBadgeWithTooltip } from '../../components/badges'

export const createGradeSuggestionColumn = (
  assessmentCompletions: AssessmentCompletion[] | undefined,
): ExtraParticipantColumn | undefined => {
  if (!assessmentCompletions) return undefined

  const completedGradings = assessmentCompletions.filter((a) => a.completed)

  return {
    id: 'gradeSuggestion',
    header: 'Grade',
    accessorFn: (row) => {
      const match = completedGradings.find(
        (a) => a.courseParticipationID === row.courseParticipationID,
      )
      return match ? match.gradeSuggestion.toFixed(1) : ''
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const gradeSuggestionA =
        completedGradings.find(
          (s) => s.courseParticipationID === rowA.original.courseParticipationID,
        )?.gradeSuggestion ?? 6

      const gradeSuggestionB =
        completedGradings.find(
          (s) => s.courseParticipationID === rowB.original.courseParticipationID,
        )?.gradeSuggestion ?? 6

      return gradeSuggestionA - gradeSuggestionB
    },
    extraData: completedGradings.map((s) => ({
      courseParticipationID: s.courseParticipationID,
      value: <GradeSuggestionBadgeWithTooltip gradeSuggestion={s.gradeSuggestion} text={false} />,
      stringValue: s.gradeSuggestion.toFixed(1),
    })),
  }
}
