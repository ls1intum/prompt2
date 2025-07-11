import { format } from 'date-fns'
import { Clock } from 'lucide-react'
import { Badge } from '@tumaet/prompt-ui-components'

interface DeadlineBadgeProps {
  deadline: Date | string
  type: 'self' | 'peer'
}

export const DeadlineBadge = ({ deadline, type }: DeadlineBadgeProps) => {
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline

  const badgeClassName =
    type === 'self'
      ? 'bg-blue-100 text-blue-800 border-blue-200 dark:border-blue-700 flex items-center gap-1 hover:bg-blue-100'
      : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 flex items-center gap-1'

  return (
    <Badge className={badgeClassName}>
      <Clock className='h-3 w-3' />
      Deadline: {format(deadlineDate, 'dd.MM.yyyy')}
    </Badge>
  )
}
