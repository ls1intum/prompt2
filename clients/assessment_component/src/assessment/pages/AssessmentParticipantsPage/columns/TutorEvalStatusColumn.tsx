import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/ExtraParticipationTableColumn'
import { PeerEvaluationCompletionBadge } from '../../components/badges'
import { EvaluationCompletion } from '../../../interfaces/evaluationCompletion'
import { AssessmentParticipationWithStudent } from '../../../interfaces/assessmentParticipationWithStudent'
import { TeamWithStudents } from './TeamColumn'
import { Team } from '../../../interfaces/team'

export const createTutorEvalStatusColumn = (
  tutorEvaluationCompletions: EvaluationCompletion[] | undefined,
  teamsWithStudents: TeamWithStudents[],
  teams: Team[],
  participations: AssessmentParticipationWithStudent[],
  isEnabled: boolean,
): ExtraParticipationTableColumn | undefined => {
  if (!isEnabled) return undefined

  return {
    id: 'tutorEvalStatus',
    header: 'Tutor Eval',
    accessorFn: (row) => {
      // Find the team for this student
      const studentTeam = teamsWithStudents.find((t) =>
        t.participantIds.includes(row.courseParticipationID),
      )

      if (!studentTeam) {
        return <PeerEvaluationCompletionBadge completed={0} total={0} />
      }

      // Find the full team data to get tutors
      const fullTeam = teams.find((t) => t.name === studentTeam.name)
      if (!fullTeam) {
        return <PeerEvaluationCompletionBadge completed={0} total={0} />
      }

      // Get tutor IDs
      const tutorIds = fullTeam.tutors.map((tutor) => tutor.id)

      // Count completed tutor evaluations by this student
      const completedTutorEvaluations = tutorIds.filter((tutorId) =>
        tutorEvaluationCompletions?.some(
          (completion) =>
            completion.authorCourseParticipationID === row.courseParticipationID &&
            completion.courseParticipationID === tutorId &&
            completion.completed,
        ),
      ).length

      const totalTutorEvaluations = tutorIds.length

      return (
        <PeerEvaluationCompletionBadge
          completed={completedTutorEvaluations}
          total={totalTutorEvaluations}
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

        const fullTeam = teams.find((t) => t.name === studentTeam.name)
        if (!fullTeam) return 0

        const tutorIds = fullTeam.tutors.map((tutor) => tutor.id)

        const completedTutorEvaluations = tutorIds.filter((tutorId) =>
          tutorEvaluationCompletions?.some(
            (completion) =>
              completion.authorCourseParticipationID === row.original.courseParticipationID &&
              completion.courseParticipationID === tutorId &&
              completion.completed,
          ),
        ).length

        const totalTutorEvaluations = tutorIds.length

        return totalTutorEvaluations > 0 ? completedTutorEvaluations / totalTutorEvaluations : 0
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

      const fullTeam = teams.find((t) => t.name === studentTeam.name)
      if (!fullTeam) {
        return {
          courseParticipationID: p.courseParticipationID,
          value: <PeerEvaluationCompletionBadge completed={0} total={0} />,
          stringValue: '0/0',
        }
      }

      const tutorIds = fullTeam.tutors.map((tutor) => tutor.id)

      const completedTutorEvaluations = tutorIds.filter((tutorId) =>
        tutorEvaluationCompletions?.some(
          (completion) =>
            completion.authorCourseParticipationID === p.courseParticipationID &&
            completion.courseParticipationID === tutorId &&
            completion.completed,
        ),
      ).length

      const totalTutorEvaluations = tutorIds.length
      const statusText = `${completedTutorEvaluations}/${totalTutorEvaluations}`

      return {
        courseParticipationID: p.courseParticipationID,
        value: (
          <PeerEvaluationCompletionBadge
            completed={completedTutorEvaluations}
            total={totalTutorEvaluations}
          />
        ),
        stringValue: statusText,
      }
    }),
  }
}
