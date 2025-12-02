import { Team } from '@tumaet/prompt-shared-state'

import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticipationsTable/interfaces/ExtraParticipationTableColumn'

import { AssessmentParticipationWithStudent } from '../../../interfaces/assessmentParticipationWithStudent'
import { EvaluationCompletion } from '../../../interfaces/evaluationCompletion'

import { PeerEvaluationCompletionBadge } from '../../components/badges'

import { createEvaluationLookup, getEvaluationCounts } from '../utils/evaluationUtils'

export const createPeerEvalStatusColumn = (
  peerEvaluationCompletions: EvaluationCompletion[] | undefined,
  teams: Team[],
  participations: AssessmentParticipationWithStudent[],
  isEnabled: boolean,
): ExtraParticipationTableColumn | undefined => {
  if (!isEnabled) return undefined

  const evaluationLookup = createEvaluationLookup(peerEvaluationCompletions)

  return {
    id: 'peerEvalStatus',
    header: 'Peer Eval',
    accessorFn: (row) => {
      const team = teams.find((t) =>
        t.members.some((member) => member.id === row.courseParticipationID),
      )

      if (!team) {
        return <PeerEvaluationCompletionBadge completed={0} total={0} />
      }

      const teamMemberIds = team.members
        .map((member) => member.id)
        .filter((id): id is string => id !== undefined && id !== row.courseParticipationID)

      const counts = getEvaluationCounts(row.courseParticipationID, teamMemberIds, evaluationLookup)

      return <PeerEvaluationCompletionBadge completed={counts.completed} total={counts.total} />
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const getCompletionRatio = (row: any) => {
        const team = teams.find((t) =>
          t.members.some((member) => member.id === row.original.courseParticipationID),
        )
        if (!team) return 0

        const teamMemberIds = team.members
          .map((member) => member.id)
          .filter(
            (id): id is string => id !== undefined && id !== row.original.courseParticipationID,
          )

        const counts = getEvaluationCounts(
          row.original.courseParticipationID,
          teamMemberIds,
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

      const teamMemberIds = team.members
        .map((member) => member.id)
        .filter((id): id is string => id !== undefined && id !== p.courseParticipationID)

      const counts = getEvaluationCounts(p.courseParticipationID, teamMemberIds, evaluationLookup)

      const statusText = `${counts.completed}/${counts.total}`

      return {
        courseParticipationID: p.courseParticipationID,
        value: <PeerEvaluationCompletionBadge completed={counts.completed} total={counts.total} />,
        stringValue: statusText,
      }
    }),
  }
}
