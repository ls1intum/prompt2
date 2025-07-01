import { useMemo } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { ManagementPageHeader, ErrorPage } from '@tumaet/prompt-ui-components'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'

import { StudentScoreBadge } from '../components/StudentScoreBadge'
import { GradeSuggestionBadge } from '../components/GradeSuggestionBadge'

import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/ExtraParticipationTableColumn'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useScoreLevelStore } from '../../zustand/useScoreLevelStore'
import { useTeamStore } from '../../zustand/useTeamStore'

import { getAllAssessmentCompletionsInPhase } from '../../network/queries/getAllAssessmentCompletionsInPhase'

import { mapScoreLevelToNumber, ScoreLevel } from '../../interfaces/scoreLevel'
import { AssessmentCompletion } from '../../interfaces/assessment'
import { getLevelConfig } from '../utils/getLevelConfig'

import { AssessmentDiagram } from '../components/diagrams/AssessmentDiagram'
import { AssessmentScoreLevelDiagram } from '../components/diagrams/AssessmentScoreLevelDiagram'

export const AssessmentOverviewPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const navigate = useNavigate()
  const path = useLocation().pathname

  const { participations } = useParticipationStore()
  const { scoreLevels } = useScoreLevelStore()
  const { teams } = useTeamStore()

  const {
    data: assessmentCompletions,
    isPending: isAssessmentCompletionsPending,
    isError: isAssessmentCompletionsError,
    refetch: refetchAssessmentCompletions,
  } = useQuery<AssessmentCompletion[]>({
    queryKey: ['assessmentCompletions', phaseId],
    queryFn: () => getAllAssessmentCompletionsInPhase(phaseId ?? ''),
  })

  const isError = isAssessmentCompletionsError
  const isPending = isAssessmentCompletionsPending
  const refetch = refetchAssessmentCompletions

  const teamsWithStudents = useMemo(() => {
    return teams.map((team) => ({
      name: team.name,
      participantIds: participations
        .filter((p) => p.teamID === team.id)
        .map((p) => p.courseParticipationID),
    }))
  }, [teams, participations])

  const completedGradings = useMemo(() => {
    return assessmentCompletions?.filter((a) => a.completed) ?? []
  }, [assessmentCompletions])

  const extraColumns: ExtraParticipationTableColumn[] = useMemo(() => {
    if (!scoreLevels) return []

    return [
      {
        id: 'scoreLevel',
        header: 'Score Level',
        accessorFn: (row) => {
          const match = scoreLevels.find(
            (s) => s.courseParticipationID === row.courseParticipationID,
          )
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
        enableColumnFilter: true,
        filterFn: (row, columnId, filterValue) => {
          const match = scoreLevels.find(
            (s) => s.courseParticipationID === row.original.courseParticipationID,
          )
          const scoreLevel = match?.scoreLevel
          const scoreLevelTitle = scoreLevel ? getLevelConfig(scoreLevel).title : null
          return scoreLevelTitle ? filterValue.includes(scoreLevelTitle) : false
        },
        extraData: scoreLevels.map((s) => ({
          courseParticipationID: s.courseParticipationID,
          value: <StudentScoreBadge scoreLevel={s.scoreLevel} />,
          stringValue: getLevelConfig(s.scoreLevel).title,
        })),
      },
      assessmentCompletions
        ? {
            id: 'gradeSuggestion',
            header: 'Grade Suggestion',
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
        : undefined,
      teamsWithStudents.length > 0
        ? {
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
          }
        : undefined,
    ].filter((column) => column !== undefined)
  }, [participations, teamsWithStudents, scoreLevels, assessmentCompletions, completedGradings])

  if (isError) {
    return <ErrorPage message='Error loading assessments' onRetry={refetch} />
  }
  if (isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

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
