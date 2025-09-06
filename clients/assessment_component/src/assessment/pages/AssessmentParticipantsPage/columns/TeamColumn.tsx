import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/ExtraParticipationTableColumn'
import { AssessmentParticipationWithStudent } from '../../../interfaces/assessmentParticipationWithStudent'

interface TeamWithStudents {
  name: string
  participantIds: string[]
}

export const createTeamColumn = (
  teamsWithStudents: TeamWithStudents[],
  participations: AssessmentParticipationWithStudent[],
): ExtraParticipationTableColumn | undefined => {
  if (teamsWithStudents.length === 0) return undefined

  return {
    id: 'team',
    header: 'Team',
    accessorFn: (row) => {
      const team = teamsWithStudents.find((t) =>
        t.participantIds.includes(row.courseParticipationID),
      )
      return team ? team.name : ''
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const teamA =
        teamsWithStudents.find((t) =>
          t.participantIds.includes(rowA.original.courseParticipationID),
        )?.name ?? ''
      const teamB =
        teamsWithStudents.find((t) =>
          t.participantIds.includes(rowB.original.courseParticipationID),
        )?.name ?? ''
      return teamA.localeCompare(teamB)
    },
    extraData: participations.map((p) => {
      const team = teamsWithStudents.find((t) => t.participantIds.includes(p.courseParticipationID))
      return {
        courseParticipationID: p.courseParticipationID,
        value: team ? team.name : '',
        stringValue: team ? team.name : '',
      }
    }),
    filterFn: (row, columnId, filterValue) => {
      const team = teamsWithStudents.find((t) =>
        t.participantIds.includes(row.original.courseParticipationID),
      )
      const teamName = team ? team.name : ''
      return Array.isArray(filterValue) ? filterValue.includes(teamName) : false
    },
  }
}

export type { TeamWithStudents }
