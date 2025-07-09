import { useLocation } from 'react-router-dom'
import { Clock, Users, User, AlertCircle, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { ManagementPageHeader, Badge, Card, CardContent } from '@tumaet/prompt-ui-components'
import { useEvaluationStore } from '../../zustand/useEvaluationStore'
import { useSelfEvaluationCategoryStore } from '../../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../../zustand/usePeerEvaluationCategoryStore'
import { useTeamStore } from '../../zustand/useTeamStore'
import { useMyParticipationStore } from '../../zustand/useMyParticipationStore'
import { useCoursePhaseConfigStore } from '../../zustand/useCoursePhaseConfigStore'
import { EvaluationInfoCard } from './components/EvaluationInfoCard'

export const SelfAndPeerEvaluationOverviewPage = () => {
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
      (member) => member.courseParticipationID === myParticipation?.courseParticipationID,
    ),
  )

  const selfEvaluationCompetencyCount = selfEvaluationCategories.reduce(
    (count, category) => count + category.competencies.length,
    0,
  )

  const peerEvaluationCompetencyCount = peerEvaluationCategories.reduce(
    (count, category) => count + category.competencies.length,
    0,
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

  const allEvaluationsCompleted =
    isSelfEvaluationCompleted && completedPeerEvaluations === totalPeerEvaluations

  return (
    <div className='min-h-screen transition-colors'>
      <div className='max-w-6xl mx-auto px-4 py-6'>
        <ManagementPageHeader>Self Evaluation and Peer Evaluation</ManagementPageHeader>

        <Card className='mb-8 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-4'>
              <div className='flex-shrink-0'>
                {allEvaluationsCompleted ? (
                  <CheckCircle2 className='h-8 w-8 text-green-500 dark:text-green-400' />
                ) : (
                  <AlertCircle className='h-8 w-8 text-blue-500 dark:text-blue-400' />
                )}
              </div>
              <div className='flex-1'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
                  {allEvaluationsCompleted
                    ? 'All Evaluations Completed!'
                    : 'Evaluation Instructions'}
                </h2>
                {allEvaluationsCompleted ? (
                  <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                    Congratulations! You have successfully completed all required evaluations. Your
                    self-evaluation and peer evaluations have been submitted and will be reviewed
                    accordingly.
                  </p>
                ) : (
                  <div className='space-y-3'>
                    <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                      Please complete both your self-evaluation and peer evaluations before the
                      specified deadlines. These evaluations are important and provide valuable
                      feedback.
                    </p>
                    <div className='flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400'>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4' />
                        <span>Complete before deadline</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <User className='h-4 w-4' />
                        <span>Self-evaluation required</span>
                      </div>
                      {team && (
                        <div className='flex items-center gap-2'>
                          <Users className='h-4 w-4' />
                          <span>Evaluate all team members</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <Card className='border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                  Self Evaluation
                </h3>
                {isSelfEvaluationCompleted ? (
                  <Badge className='bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'>
                    Completed
                  </Badge>
                ) : (
                  <Badge className='bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'>
                    Pending
                  </Badge>
                )}
              </div>
              <div className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1'>
                {isSelfEvaluationCompleted ? 'Completed' : 'Open'}
              </div>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Self Evaluation completion status
              </p>
            </CardContent>
          </Card>

          {team && (
            <Card className='border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                    Peer Evaluations
                  </h3>
                  {completedPeerEvaluations === totalPeerEvaluations ? (
                    <Badge className='bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'>
                      All Completed
                    </Badge>
                  ) : (
                    <Badge className='bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'>
                      {completedPeerEvaluations}/{totalPeerEvaluations}
                    </Badge>
                  )}
                </div>
                <div className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1'>
                  {completedPeerEvaluations}/{totalPeerEvaluations}
                </div>
                <p className='text-sm text-gray-500 dark:text-gray-400'>Team members evaluated</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Self Evaluation Section */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='flex items-center gap-2'>
              <User className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                Self Evaluation
              </h1>
            </div>
            {coursePhaseConfig?.selfEvaluationDeadline && (
              <Badge className='bg-blue-100 text-blue-800 border-blue-200 dark:border-blue-700 flex items-center gap-1 hover:bg-blue-100'>
                <Clock className='h-3 w-3' />
                Deadline: {format(new Date(coursePhaseConfig.selfEvaluationDeadline), 'dd.MM.yyyy')}
              </Badge>
            )}
          </div>
          <Card className='border-gray-200 shadow-sm'>
            <EvaluationInfoCard
              name='Self Evaluation'
              navigationPath={`${path}/self-evaluation`}
              competencyCount={selfEvaluationCompetencyCount}
              completed={isSelfEvaluationCompleted}
              evaluations={selfEvaluations}
            />
          </Card>
        </div>

        {/* Peer Evaluation Section */}
        {team && (
          <div>
            <div className='flex items-center gap-3 mb-6'>
              <div className='flex items-center gap-2'>
                <Users className='h-6 w-6 text-green-600 dark:text-green-400' />
                <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
                  Peer Evaluation
                </h1>
              </div>
              <Badge className='bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'>
                Team {team.name}
              </Badge>
              {coursePhaseConfig?.peerEvaluationDeadline && (
                <Badge className='bg-green-100 text-green-800 border-green-200 hover:bg-green-100 flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  Deadline:{' '}
                  {format(new Date(coursePhaseConfig.peerEvaluationDeadline), 'dd.MM.yyyy')}
                </Badge>
              )}
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
    </div>
  )
}
