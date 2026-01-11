import { AssessmentStatusBadge } from '../../components/badges'
import { EvaluationCompletion } from '../../../interfaces/evaluationCompletion'
import { ExtraParticipantColumn } from '@/components/pages/CoursePhaseParticipationsTable/table/participationRow'

export const createSelfEvalStatusColumn = (
  selfEvaluationCompletions: EvaluationCompletion[] | undefined,
  isEnabled: boolean,
): ExtraParticipantColumn | undefined => {
  if (!isEnabled) return undefined

  return {
    id: 'selfEvalStatus',
    header: 'Self Eval',
    accessorFn: (row) => {
      const match = selfEvaluationCompletions?.find(
        (s) => s.courseParticipationID === row.courseParticipationID,
      )
      return match ? match.completed : ''
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const selfEvalA = selfEvaluationCompletions?.find(
        (s) => s.courseParticipationID === rowA.original.courseParticipationID,
      )?.completed
      const selfEvalB = selfEvaluationCompletions?.find(
        (s) => s.courseParticipationID === rowB.original.courseParticipationID,
      )?.completed
      return (selfEvalA ? 1 : 0) - (selfEvalB ? 1 : 0)
    },
    extraData:
      selfEvaluationCompletions?.map((s) => ({
        courseParticipationID: s.courseParticipationID,
        value: s.completed ? (
          <AssessmentStatusBadge remainingAssessments={0} isFinalized={true} />
        ) : null,
        stringValue: s.completed ? 'Yes' : 'No',
      })) ?? [],
  }
}
