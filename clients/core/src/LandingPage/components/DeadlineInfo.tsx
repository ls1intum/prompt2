import { format, differenceInDays } from 'date-fns'
import { Clock } from 'lucide-react'

export const DeadlineInfo = ({ deadline }: { deadline: Date }): JSX.Element => {
  const today = new Date()
  const daysUntilDeadline = differenceInDays(deadline, today)
  const isDeadlineClose = daysUntilDeadline <= 3

  return (
    <div className={`space-y-1 ${isDeadlineClose ? 'text-red-600' : 'text-gray-600'}`}>
      <div className='flex items-center space-x-2'>
        <Clock className='h-4 w-4 flex-shrink-0' />
        <p className='text-sm font-medium'>Apply by {format(deadline, 'MMMM d, yyyy')}</p>
      </div>
      <p className={`text-xs ${isDeadlineClose ? 'font-semibold' : ''} pl-6`}>
        {daysUntilDeadline > 0
          ? `${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''} remaining`
          : 'Deadline passed'}
      </p>
    </div>
  )
}
