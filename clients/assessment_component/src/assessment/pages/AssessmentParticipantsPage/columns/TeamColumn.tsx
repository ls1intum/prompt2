import { Team } from '@tumaet/prompt-shared-state'

import { AssessmentParticipationWithStudent } from '../../../interfaces/assessmentParticipationWithStudent'
import { ExtraParticipantColumn } from '@/components/pages/CoursePhaseParticipationsTable/table/participationRow'

export const createTeamColumn = (
  teams: Team[],
  participations: AssessmentParticipationWithStudent[],
): ExtraParticipantColumn | undefined => {
  if (teams.length === 0) return undefined

  return {
    id: 'team',
    header: 'Team',
    accessorFn: (row) => {
      return (
        teams.find((t) => t.members.some((member) => member.id === row.courseParticipationID))
          ?.name ?? ''
      )
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const teamA =
        teams.find((t) =>
          t.members.some((member) => member.id === rowA.original.courseParticipationID),
        )?.name ?? ''
      const teamB =
        teams.find((t) =>
          t.members.some((member) => member.id === rowB.original.courseParticipationID),
        )?.name ?? ''
      return teamA.localeCompare(teamB)
    },
    extraData: participations.map((p) => {
      const team = teams.find((t) =>
        t.members.some((member) => member.id === p.courseParticipationID),
      )
      return {
        courseParticipationID: p.courseParticipationID,
        value: team ? team.name : '',
        stringValue: team ? team.name : '',
      }
    }),
    filterFn: (row, columnId, filterValue) => {
      const team = teams.find((t) =>
        t.members.some((member) => member.id === row.original.courseParticipationID),
      )
      const teamName = team ? team.name : ''
      return Array.isArray(filterValue) ? filterValue.includes(teamName) : false
    },
  }
}
