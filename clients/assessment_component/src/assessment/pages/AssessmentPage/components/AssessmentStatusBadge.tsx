import { CheckCircle, Clock, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssessmentStatusBadgeProps {
  remainingAssessments: number
  isFinalized?: boolean
  className?: string
}

export default function AssessmentStatusBadge({
  remainingAssessments,
  isFinalized,
  className,
}: AssessmentStatusBadgeProps) {
  // Determine status
  const isCompleted = remainingAssessments === 0
  const isInProgress = remainingAssessments > 0
  const isCompletedButNotFinalized = isCompleted && !isFinalized

  // Set badge styles based on status
  const badgeStyles = cn(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
    {
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400':
        isCompleted && isFinalized,
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400':
        isCompletedButNotFinalized,
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': isInProgress,
    },
    className,
  )

  return (
    <span className={badgeStyles}>
      {isCompleted && isFinalized && (
        <>
          <CheckCircle className='h-3.5 w-3.5' />
          <span>Final</span>
        </>
      )}

      {isCompletedButNotFinalized && (
        <>
          <CircleCheck className='h-3.5 w-3.5' />
          <span>Ready to finalize</span>
        </>
      )}

      {isInProgress && (
        <>
          <Clock className='h-3.5 w-3.5' />
          <span>
            {remainingAssessments} {remainingAssessments === 1 ? 'assessment' : 'assessments'} left
          </span>
        </>
      )}
    </span>
  )
}
