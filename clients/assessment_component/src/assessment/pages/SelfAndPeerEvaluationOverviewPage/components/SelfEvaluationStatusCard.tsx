import { Card, CardContent } from '@tumaet/prompt-ui-components'
import { AssessmentStatusBadge } from '../../components/AssessmentStatusBadge'
import { DeadlineBadge } from '../../components/DeadlineBadge'
import { useCoursePhaseConfigStore } from '../../../zustand/useCoursePhaseConfigStore'

interface SelfEvaluationStatusCardProps {
  isCompleted: boolean
}

export const SelfEvaluationStatusCard = ({ isCompleted }: SelfEvaluationStatusCardProps) => {
  const { coursePhaseConfig } = useCoursePhaseConfigStore()

  return (
    <Card className='border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Self Evaluation</h3>
          {isCompleted ? (
            <AssessmentStatusBadge remainingAssessments={0} isFinalized={true} />
          ) : (
            <DeadlineBadge deadline={coursePhaseConfig?.selfEvaluationDeadline ?? ''} type='self' />
          )}
        </div>
        <div className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1'>
          {isCompleted ? 'Completed' : 'Open'}
        </div>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Self Evaluation completion status
        </p>
      </CardContent>
    </Card>
  )
}
