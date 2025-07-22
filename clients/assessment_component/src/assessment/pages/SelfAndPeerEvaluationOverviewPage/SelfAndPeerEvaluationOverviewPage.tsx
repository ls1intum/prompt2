import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Users, User } from 'lucide-react'

import { useCourseStore } from '@tumaet/prompt-shared-state'
import { ManagementPageHeader, Badge, Card } from '@tumaet/prompt-ui-components'

import { useEvaluationStore } from '../../zustand/useEvaluationStore'
import { useSelfEvaluationCategoryStore } from '../../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../../zustand/usePeerEvaluationCategoryStore'
import { useTeamStore } from '../../zustand/useTeamStore'
import { useMyParticipationStore } from '../../zustand/useMyParticipationStore'
import { useCoursePhaseConfigStore } from '../../zustand/useCoursePhaseConfigStore'

import { EvaluationInfoCard } from './components/EvaluationInfoCard'
import { EvaluationInfoHeader } from './components/EvaluationInfoHeader'
import { SelfEvaluationStatusCard } from './components/SelfEvaluationStatusCard'
import { PeerEvaluationStatusCard } from './components/PeerEvaluationStatusCard'
import { ActionItemsAndGradeSuggestion } from './components/ActionItemsAndGradeSuggestion'

export const SelfAndPeerEvaluationOverviewPage = () => {
  const { isStudentOfCourse } = useCourseStore()
  const { courseId } = useParams<{ courseId: string }>()
  const isStudent = isStudentOfCourse(courseId ?? '')

  const path = useLocation().pathname
  const { selfEvaluations, peerEvaluations, selfEvaluationCompletion, peerEvaluationCompletions } =
    useEvaluationStore()
  const { selfEvaluationCategories } = useSelfEvaluationCategoryStore()
  const { peerEvaluationCategories } = usePeerEvaluationCategoryStore()
  const { myParticipation } = useMyParticipationStore()
  const { teams } = useTeamStore()
  const { coursePhaseConfig } = useCoursePhaseConfigStore()

  const team = teams.find((t) =>
    t.members.some(
      (member) =>
        member.courseParticipationID === myParticipation?.courseParticipationID || !isStudent,
    ),
  )

  const now = new Date()
  const selfEvaluationStarted =
    coursePhaseConfig?.selfEvaluationEnabled &&
    (!coursePhaseConfig?.selfEvaluationStart ||
      now >= new Date(coursePhaseConfig.selfEvaluationStart))
  const peerEvaluationStarted =
    coursePhaseConfig?.peerEvaluationEnabled &&
    (!coursePhaseConfig?.peerEvaluationStart ||
      now >= new Date(coursePhaseConfig.peerEvaluationStart))

  const selfEvaluationCompetencyCount = useMemo(
    () =>
      selfEvaluationCategories.reduce((count, category) => count + category.competencies.length, 0),
    [selfEvaluationCategories],
  )

  const peerEvaluationCompetencyCount = useMemo(
    () =>
      peerEvaluationCategories.reduce((count, category) => count + category.competencies.length, 0),
    [peerEvaluationCategories],
  )

  const isSelfEvaluationCompleted = selfEvaluationCompletion?.completed ?? false

  const completedPeerEvaluations =
    team?.members
      .filter((member) => member.courseParticipationID !== myParticipation?.courseParticipationID)
      .filter(
        (member) =>
          peerEvaluationCompletions.find(
            (c) => c.courseParticipationID === member.courseParticipationID,
          )?.completed,
      ).length ?? 0

  const totalPeerEvaluations =
    team?.members.filter(
      (member) => member.courseParticipationID !== myParticipation?.courseParticipationID,
    ).length ?? 0

  const isPeerEvaluationCompleted = completedPeerEvaluations === totalPeerEvaluations
  const allEvaluationsCompleted = isSelfEvaluationCompleted && isPeerEvaluationCompleted

  const isAssessmentDeadlinePassed = coursePhaseConfig?.deadline
    ? now >= new Date(coursePhaseConfig.deadline)
    : false

  return (
    <div className='min-h-screen transition-colors'>
      <div className='max-w-6xl mx-auto px-4 py-6'>
        <ManagementPageHeader>
          {isAssessmentDeadlinePassed
            ? 'Your Action Items and Grade Suggestion'
            : 'Self Evaluation' + (peerEvaluationStarted && ' and Peer Evaluation')}
        </ManagementPageHeader>

        <EvaluationInfoHeader allEvaluationsCompleted={allEvaluationsCompleted} team={team} />

        {!isAssessmentDeadlinePassed && (
          <div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
              {selfEvaluationStarted && (
                <SelfEvaluationStatusCard isCompleted={isSelfEvaluationCompleted} />
              )}

              {peerEvaluationStarted && team && (
                <PeerEvaluationStatusCard
                  completedEvaluations={completedPeerEvaluations}
                  totalEvaluations={totalPeerEvaluations}
                  isCompleted={isPeerEvaluationCompleted}
                />
              )}
            </div>
            {selfEvaluationStarted && (
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='flex items-center gap-2'>
                    <User className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                    <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                      Self Evaluation
                    </h1>
                  </div>
                </div>
                <Card className='border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'>
                  <EvaluationInfoCard
                    name='Self Evaluation'
                    navigationPath={`${path}/self-evaluation`}
                    competencyCount={selfEvaluationCompetencyCount}
                    completed={isSelfEvaluationCompleted}
                    evaluations={selfEvaluations}
                  />
                </Card>
              </div>
            )}
            {peerEvaluationStarted && team && (
              <div className='mb-8'>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-6 w-6 text-green-600 dark:text-green-400' />
                    <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                      Peer Evaluation
                    </h1>
                  </div>
                  <Badge className='bg-gray-100 dark:bg-gray-100 text-gray-800 dark:text-gray-800 border-gray-200 dark:border-gray-200 hover:bg-gray-200 dark:hover:bg-gray-200'>
                    Team {team.name}
                  </Badge>
                </div>
                <div className='space-y-4'>
                  {team.members
                    .filter(
                      (member) =>
                        member.courseParticipationID !== myParticipation?.courseParticipationID,
                    )
                    .map((member) => (
                      <Card
                        key={member.courseParticipationID}
                        className='border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'
                      >
                        <EvaluationInfoCard
                          name={member.studentName}
                          navigationPath={`${path}/peer-evaluation/${member?.courseParticipationID}`}
                          competencyCount={peerEvaluationCompetencyCount}
                          completed={
                            peerEvaluationCompletions.find(
                              (c) => c.courseParticipationID === member.courseParticipationID,
                            )?.completed ?? false
                          }
                          evaluations={peerEvaluations.filter(
                            (evaluation) =>
                              evaluation.courseParticipationID === member.courseParticipationID,
                          )}
                        />
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isAssessmentDeadlinePassed && <ActionItemsAndGradeSuggestion />}
      </div>
    </div>
  )
}
