import { useMemo } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { ManagementPageHeader, ErrorPage } from '@tumaet/prompt-ui-components'
import { CoursePhaseParticipationsTablePage } from '@/components/pages/CoursePhaseParticpationsTable/CoursePhaseParticipationsTablePage'

import { StudentScoreBadge } from '../components/StudentScoreBadge'
import { GradeSuggestionBadge } from '../components/GradeSuggestionBadge'
import { PeerEvaluationCompletionBadge } from '../components/PeerEvaluationCompletionBadge'

import { ExtraParticipationTableColumn } from '@/components/pages/CoursePhaseParticpationsTable/interfaces/ExtraParticipationTableColumn'

import { useCoursePhaseConfigStore } from '../../zustand/useCoursePhaseConfigStore'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useScoreLevelStore } from '../../zustand/useScoreLevelStore'
import { useTeamStore } from '../../zustand/useTeamStore'

import { getAllAssessmentCompletionsInPhase } from '../../network/queries/getAllAssessmentCompletionsInPhase'
import { getAllSelfEvaluationCompletionsInPhase } from '../../network/queries/getAllSelfEvaluationCompletionsInPhase'
import { getAllPeerEvaluationCompletionsInPhase } from '../../network/queries/getAllPeerEvaluationCompletionsInPhase'

import { mapScoreLevelToNumber, ScoreLevel } from '../../interfaces/scoreLevel'
import { AssessmentCompletion } from '../../interfaces/assessmentCompletion'
import { getLevelConfig } from '../utils/getLevelConfig'

import { AssessmentDiagram } from '../components/diagrams/AssessmentDiagram'
import { ScoreLevelDistributionDiagram } from '../components/diagrams/ScoreLevelDistributionDiagram'
import { GradeDistributionDiagram } from '../components/diagrams/GradeDistributionDiagram'
import { AssessmentStatusBadge } from '../components/AssessmentStatusBadge'

export const AssessmentParticipantsPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const navigate = useNavigate()
  const path = useLocation().pathname

  const { coursePhaseConfig } = useCoursePhaseConfigStore()
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

  const {
    data: selfEvaluationCompletions,
    isPending: isSelfEvaluationCompletionsPending,
    isError: isSelfEvaluationCompletionsError,
    refetch: refetchSelfEvaluationCompletions,
  } = useQuery({
    queryKey: ['selfEvaluationCompletions', phaseId],
    queryFn: () => getAllSelfEvaluationCompletionsInPhase(phaseId ?? ''),
  })

  const {
    data: peerEvaluationCompletions,
    isPending: isPeerEvaluationCompletionsPending,
    isError: isPeerEvaluationCompletionsError,
    refetch: refetchPeerEvaluationCompletions,
  } = useQuery({
    queryKey: ['peerEvaluationCompletions', phaseId],
    queryFn: () => getAllPeerEvaluationCompletionsInPhase(phaseId ?? ''),
  })

  const isError =
    isAssessmentCompletionsError ||
    isSelfEvaluationCompletionsError ||
    isPeerEvaluationCompletionsError
  const isPending =
    isAssessmentCompletionsPending ||
    isSelfEvaluationCompletionsPending ||
    isPeerEvaluationCompletionsPending
  const refetch = () => {
    refetchAssessmentCompletions()
    refetchSelfEvaluationCompletions()
    refetchPeerEvaluationCompletions()
  }

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

  const completedGrades = useMemo(() => {
    return completedGradings.map((completion) => completion.gradeSuggestion)
  }, [completedGradings])

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
        extraData: scoreLevels.map((s) => ({
          courseParticipationID: s.courseParticipationID,
          value: <StudentScoreBadge scoreLevel={s.scoreLevel} showTooltip={true} />,
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
              const team = teamsWithStudents.find((t) =>
                t.participantIds.includes(p.courseParticipationID),
              )
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
        : undefined,
      coursePhaseConfig?.selfEvaluationEnabled
        ? {
            id: 'selfEvalStatus',
            header: 'Self Eval Status',
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
        : undefined,
      coursePhaseConfig?.peerEvaluationEnabled
        ? {
            id: 'peerEvalStatus',
            header: 'Peer Eval Status',
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
                      completion.authorCourseParticipationID ===
                        row.original.courseParticipationID &&
                      completion.courseParticipationID === memberId &&
                      completion.completed,
                  ),
                ).length

                const totalPeerEvaluations = teamMemberIds.length

                return totalPeerEvaluations > 0
                  ? completedPeerEvaluations / totalPeerEvaluations
                  : 0
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
        : undefined,
    ].filter((column) => column !== undefined)
  }, [
    participations,
    teamsWithStudents,
    scoreLevels,
    assessmentCompletions,
    completedGradings,
    coursePhaseConfig,
    selfEvaluationCompletions,
    peerEvaluationCompletions,
  ])

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
      <ManagementPageHeader>Assessment Participants</ManagementPageHeader>
      <p className='text-sm text-muted-foreground mb-4'>
        Click on a participant to view/edit their assessment.
      </p>
      <div className='grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-6'>
        <AssessmentDiagram
          participations={participations}
          scoreLevels={scoreLevels}
          completions={assessmentCompletions}
        />
        <GradeDistributionDiagram participations={participations} grades={completedGrades} />
        <ScoreLevelDistributionDiagram participations={participations} scoreLevels={scoreLevels} />
      </div>
      <div className='w-full'>
        <CoursePhaseParticipationsTablePage
          participants={participations ?? []}
          prevDataKeys={[]}
          restrictedDataKeys={[]}
          studentReadableDataKeys={[]}
          extraColumns={extraColumns}
          onClickRowAction={(student) => navigate(`${path}/${student.courseParticipationID}`)}
          key={JSON.stringify(scoreLevels)}
        />
      </div>
    </div>
  )
}
