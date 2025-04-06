import { CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssessmentBadgeProps {
  remainingAssessments: number
  className?: string
}

export default function AssessmentStatusBadge({
  remainingAssessments,
  className,
}: AssessmentBadgeProps) {
  // Determine status
  const isComplete = remainingAssessments === 0
  const isInProgress = remainingAssessments > 0

  // Set badge styles based on status
  const badgeStyles = cn(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
    {
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': isComplete,

      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': isInProgress,
    },
    className,
  )

  return (
    <span className={badgeStyles}>
      {isComplete && (
        <>
          <CheckCircle className='h-3.5 w-3.5' />
          <span>Completed</span>
        </>
      )}

      {isInProgress && (
        <>
          <Clock className='h-3.5 w-3.5' />
          <span>
            {remainingAssessments} {remainingAssessments === 1 ? 'attempt' : 'attempts'} left
          </span>
        </>
      )}
    </span>
  )
}
