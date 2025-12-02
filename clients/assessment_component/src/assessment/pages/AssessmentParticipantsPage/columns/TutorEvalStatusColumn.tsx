import { Row } from '@tanstack/table-core'
import { CoursePhaseParticipationWithStudent, Team } from '@tumaet/prompt-shared-state'

import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticipationsTable/interfaces/ExtraParticipationTableColumn'

import { AssessmentParticipationWithStudent } from '../../../interfaces/assessmentParticipationWithStudent'
import { EvaluationCompletion } from '../../../interfaces/evaluationCompletion'

import { PeerEvaluationCompletionBadge } from '../../components/badges'

import { createEvaluationLookup, getEvaluationCounts } from '../utils/evaluationUtils'

export const createTutorEvalStatusColumn = (
  tutorEvaluationCompletions: EvaluationCompletion[] | undefined,
  teams: Team[],
  participations: AssessmentParticipationWithStudent[],
  isEnabled: boolean,
): ExtraParticipationTableColumn | undefined => {
  if (!isEnabled) return undefined

  const evaluationLookup = createEvaluationLookup(tutorEvaluationCompletions)

  return {
    id: 'tutorEvalStatus',
    header: 'Tutor Eval',
    accessorFn: (row) => {
      const team = teams.find((t) =>
        t.members.some((member) => member.id === row.courseParticipationID),
      )

      if (!team) {
        return <PeerEvaluationCompletionBadge completed={0} total={0} />
      }

      const tutorIds = team.tutors
        .map((tutor) => tutor.id)
        .filter((id): id is string => id !== undefined)
      const counts = getEvaluationCounts(row.courseParticipationID, tutorIds, evaluationLookup)

      return <PeerEvaluationCompletionBadge completed={counts.completed} total={counts.total} />
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const getCompletionRatio = (row: Row<CoursePhaseParticipationWithStudent>) => {
        const team = teams.find((t) =>
          t.members.some((member) => member.id === row.original.courseParticipationID),
        )

        if (!team) return 0

        const tutorIds = team.tutors
          .map((tutor) => tutor.id)
          .filter((id): id is string => id !== undefined)
        const counts = getEvaluationCounts(
          row.original.courseParticipationID,
          tutorIds,
          evaluationLookup,
        )

        return counts.total > 0 ? counts.completed / counts.total : 0
      }

      return getCompletionRatio(rowA) - getCompletionRatio(rowB)
    },
    extraData: participations.map((p) => {
      const team = teams.find((t) => t.id === p.teamID)

      if (!team) {
        return {
          courseParticipationID: p.courseParticipationID,
          value: <PeerEvaluationCompletionBadge completed={0} total={0} />,
          stringValue: '0/0',
        }
      }

      const tutorIds = team.tutors
        .map((tutor) => tutor.id)
        .filter((id): id is string => id !== undefined)
      const counts = getEvaluationCounts(p.courseParticipationID, tutorIds, evaluationLookup)

      const statusText = `${counts.completed}/${counts.total}`

      return {
        courseParticipationID: p.courseParticipationID,
        value: <PeerEvaluationCompletionBadge completed={counts.completed} total={counts.total} />,
        stringValue: statusText,
      }
    }),
  }
}
