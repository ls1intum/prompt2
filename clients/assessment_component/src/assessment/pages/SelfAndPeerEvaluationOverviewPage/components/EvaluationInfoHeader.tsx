import { AlertCircle, CheckCircle2, Clock, User, Users, Calendar } from 'lucide-react'
import { Card, CardContent } from '@tumaet/prompt-ui-components'
import { format } from 'date-fns'
import { CoursePhaseConfig } from '../../../interfaces/coursePhaseConfig'
import { Team } from '../../../interfaces/team'

interface EvaluationInfoHeaderProps {
  allEvaluationsCompleted: boolean
  coursePhaseConfig: CoursePhaseConfig | undefined
  team: Team | undefined
}

export const EvaluationInfoHeader = ({
  allEvaluationsCompleted,
  coursePhaseConfig,
  team,
}: EvaluationInfoHeaderProps) => {
  const now = new Date()
  const selfEvaluationStarted =
    !coursePhaseConfig?.selfEvaluationStart ||
    now >= new Date(coursePhaseConfig.selfEvaluationStart)
  const peerEvaluationStarted =
    !coursePhaseConfig?.peerEvaluationStart ||
    now >= new Date(coursePhaseConfig.peerEvaluationStart)

  const evaluationsNotStarted =
    !selfEvaluationStarted || (coursePhaseConfig?.peerEvaluationEnabled && !peerEvaluationStarted)

  return (
    <Card className='mb-8 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'>
      <CardContent className='p-6'>
        <div className='flex items-start gap-4'>
          <div className='flex-shrink-0'>
            {allEvaluationsCompleted ? (
              <CheckCircle2 className='h-8 w-8 text-green-500 dark:text-green-400' />
            ) : evaluationsNotStarted ? (
              <Calendar className='h-8 w-8 text-orange-500 dark:text-orange-400' />
            ) : (
              <AlertCircle className='h-8 w-8 text-blue-500 dark:text-blue-400' />
            )}
          </div>
          <div className='flex-1'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
              {allEvaluationsCompleted
                ? 'All Evaluations Completed!'
                : evaluationsNotStarted
                  ? 'Evaluations Not Yet Available'
                  : 'Instructions'}
            </h2>
            {allEvaluationsCompleted ? (
              <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                Congratulations! You have successfully completed all required evaluations. Your
                self-evaluation
                {coursePhaseConfig?.peerEvaluationEnabled && ' and peer evaluations'} have been
                submitted and will be reviewed accordingly.
              </p>
            ) : evaluationsNotStarted ? (
              <div className='space-y-3'>
                <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                  {!selfEvaluationStarted && !peerEvaluationStarted
                    ? 'Self and peer evaluations will be available soon. Please check back after the start date.'
                    : !selfEvaluationStarted
                      ? 'Self evaluation will be available soon. Please check back after the start date.'
                      : 'Peer evaluation will be available soon. Please check back after the start date.'}
                </p>
                <div className='flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400'>
                  {!selfEvaluationStarted && coursePhaseConfig?.selfEvaluationStart && (
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      <span>
                        Self evaluation starts:{' '}
                        {format(new Date(coursePhaseConfig.selfEvaluationStart), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {!peerEvaluationStarted && coursePhaseConfig?.peerEvaluationStart && (
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      <span>
                        Peer evaluation starts:{' '}
                        {format(new Date(coursePhaseConfig.peerEvaluationStart), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className='space-y-3'>
                <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                  Please complete your self-evaluation
                  {coursePhaseConfig?.peerEvaluationEnabled && ' and peer evaluations'} before the
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
  )
}
