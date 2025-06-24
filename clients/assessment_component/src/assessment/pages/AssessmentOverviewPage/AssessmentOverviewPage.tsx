import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { ManagementPageHeader } from '@tumaet/prompt-ui-components'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'

import { StudentScoreBadge } from '../components/StudentScoreBadge'

import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/ExtraParticipationTableColumn'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useScoreLevelStore } from '../../zustand/useScoreLevelStore'
import { useTeamStore } from '../../zustand/useTeamStore'

import { mapScoreLevelToNumber, ScoreLevel } from '../../interfaces/scoreLevel'

import { AssessmentDiagram } from '../components/diagrams/AssessmentDiagram'
import { AssessmentScoreLevelDiagram } from '../components/diagrams/AssessmentScoreLevelDiagram'

export const AssessmentOverviewPage = (): JSX.Element => {
  const navigate = useNavigate()
  const path = useLocation().pathname

  const { participations } = useParticipationStore()
  const { scoreLevels } = useScoreLevelStore()
  const { teams } = useTeamStore()

  const teamsWithStudents = useMemo(() => {
    return teams.map((team) => ({
      name: team.name,
      participantIds: participations
        .filter((p) => p.teamID === team.id)
        .map((p) => p.courseParticipationID),
    }))
  }, [teams, participations])

  const extraColumns: ExtraParticipationTableColumn[] = useMemo(() => {
    if (!scoreLevels) return []

    const tmpExtraColumns = [] as ExtraParticipationTableColumn[]

    tmpExtraColumns.push({
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
      extraData: scoreLevels.map((s) => ({
        courseParticipationID: s.courseParticipationID,
        value: <StudentScoreBadge scoreLevel={s.scoreLevel} />,
        stringValue: s.scoreLevel,
      })),
    })

    if (teamsWithStudents.length > 0) {
      tmpExtraColumns.push({
        id: 'team',
        header: 'Team',
        accessorFn: (row) => {
          const team = teamsWithStudents.find((t) =>
            t.participantIds.includes(row.courseParticipationID),
          )
          return team ? team.name : 'No Team'
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
          const team = teamsWithStudents.find((t) =>
            t.participantIds.includes(p.courseParticipationID),
          )
          return {
            courseParticipationID: p.courseParticipationID,
            value: team ? team.name : 'No Team',
            stringValue: team ? team.name : 'No Team',
          }
        }),
        filterFn: (row, filterValue) => {
          const team = teamsWithStudents.find((t) =>
            t.participantIds.includes(row.original.courseParticipationID),
          )
          return team ? team.name.toLowerCase().includes(filterValue.toLowerCase()) : false
        },
      })
    }

    return tmpExtraColumns
  }, [participations, teamsWithStudents, scoreLevels])

  return (
    <div id='table-view' className='relative flex flex-col'>
      <ManagementPageHeader>Assessment Overview</ManagementPageHeader>
      <p className='text-sm text-muted-foreground mb-4'>
        Click on a participant to view/edit their assessment.
      </p>
      <div className='grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6'>
        <AssessmentDiagram participations={participations} scoreLevels={scoreLevels} />
        <AssessmentScoreLevelDiagram participations={participations} scoreLevels={scoreLevels} />
      </div>
      <div className='w-full'>
        <CoursePhaseParticipationsTablePage
          participants={participations ?? []}
          prevDataKeys={[]}
          restrictedDataKeys={[]}
          studentReadableDataKeys={[]}
          extraColumns={extraColumns}
          onClickRowAction={(student) =>
            navigate(`${path}/student-assessment/${student.courseParticipationID}`)
          }
          key={JSON.stringify(scoreLevels)}
        />
      </div>
    </div>
  )
}
