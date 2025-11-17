import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticipationsTable/interfaces/ExtraParticipationTableColumn'
import { GradeSuggestionBadge } from '../../components/badges'
import { AssessmentCompletion } from '../../../interfaces/assessmentCompletion'

export const createGradeSuggestionColumn = (
  assessmentCompletions: AssessmentCompletion[] | undefined,
): ExtraParticipationTableColumn | undefined => {
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
      value: <GradeSuggestionBadge gradeSuggestion={s.gradeSuggestion} text={false} />,
      stringValue: s.gradeSuggestion.toFixed(1),
    })),
  }
}
