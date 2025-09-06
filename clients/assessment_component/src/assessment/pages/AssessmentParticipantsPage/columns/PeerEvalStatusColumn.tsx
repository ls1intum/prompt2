import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/ExtraParticipationTableColumn'
import { PeerEvaluationCompletionBadge } from '../../components/badges'
import { EvaluationCompletion } from '../../../interfaces/evaluationCompletion'
import { AssessmentParticipationWithStudent } from '../../../interfaces/assessmentParticipationWithStudent'
import { TeamWithStudents } from './TeamColumn'

export const createPeerEvalStatusColumn = (
  peerEvaluationCompletions: EvaluationCompletion[] | undefined,
  teamsWithStudents: TeamWithStudents[],
  participations: AssessmentParticipationWithStudent[],
  isEnabled: boolean,
): ExtraParticipationTableColumn | undefined => {
  if (!isEnabled) return undefined

  return {
    id: 'peerEvalStatus',
    header: 'Peer Eval',
    accessorFn: (row) => {
      // Find the team for this student
      const studentTeam = teamsWithStudents.find((t) =>
        t.participantIds.includes(row.courseParticipationID),
      )

      if (!studentTeam) {
        return <PeerEvaluationCompletionBadge completed={0} total={0} />
      }

      // Get team members excluding the current student
      const teamMemberIds = studentTeam.participantIds.filter(
        (id) => id !== row.courseParticipationID,
      )

      // Count completed peer evaluations by this student
      const completedPeerEvaluations = teamMemberIds.filter((memberId) =>
        peerEvaluationCompletions?.some(
          (completion) =>
            completion.authorCourseParticipationID === row.courseParticipationID &&
            completion.courseParticipationID === memberId &&
            completion.completed,
        ),
      ).length

      const totalPeerEvaluations = teamMemberIds.length

      return (
        <PeerEvaluationCompletionBadge
          completed={completedPeerEvaluations}
          total={totalPeerEvaluations}
        />
      )
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      // Helper function to calculate completion ratio
      const getCompletionRatio = (row: any) => {
        const studentTeam = teamsWithStudents.find((t) =>
          t.participantIds.includes(row.original.courseParticipationID),
        )

        if (!studentTeam) return 0

        const teamMemberIds = studentTeam.participantIds.filter(
          (id) => id !== row.original.courseParticipationID,
        )

        const completedPeerEvaluations = teamMemberIds.filter((memberId) =>
          peerEvaluationCompletions?.some(
            (completion) =>
              completion.authorCourseParticipationID === row.original.courseParticipationID &&
              completion.courseParticipationID === memberId &&
              completion.completed,
          ),
        ).length

        const totalPeerEvaluations = teamMemberIds.length

        return totalPeerEvaluations > 0 ? completedPeerEvaluations / totalPeerEvaluations : 0
      }

      return getCompletionRatio(rowA) - getCompletionRatio(rowB)
    },
    extraData: participations.map((p) => {
      const studentTeam = teamsWithStudents.find((t) =>
        t.participantIds.includes(p.courseParticipationID),
      )

      if (!studentTeam) {
        return {
          courseParticipationID: p.courseParticipationID,
          value: <PeerEvaluationCompletionBadge completed={0} total={0} />,
          stringValue: '0/0',
        }
      }

      const teamMemberIds = studentTeam.participantIds.filter(
        (id) => id !== p.courseParticipationID,
      )

      const completedPeerEvaluations = teamMemberIds.filter((memberId) =>
        peerEvaluationCompletions?.some(
          (completion) =>
            completion.authorCourseParticipationID === p.courseParticipationID &&
            completion.courseParticipationID === memberId &&
            completion.completed,
        ),
      ).length

      const totalPeerEvaluations = teamMemberIds.length
      const statusText = `${completedPeerEvaluations}/${totalPeerEvaluations}`

      return {
        courseParticipationID: p.courseParticipationID,
        value: (
          <PeerEvaluationCompletionBadge
            completed={completedPeerEvaluations}
            total={totalPeerEvaluations}
          />
        ),
        stringValue: statusText,
      }
    }),
  }
}
