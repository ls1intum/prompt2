import { differenceInHours, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Clock } from 'lucide-react'

export const DeadlineInfo = ({ deadline }: { deadline: Date }): JSX.Element => {
  const now = new Date()
  const timeZone = 'Europe/Paris' // This corresponds to GMT+1 (or GMT+2 during daylight saving time)

  // Convert the current time to GMT+1 for accurate comparison
  const nowInGMT1 = toZonedTime(now, timeZone)

  // Calculate the difference in hours
  const hoursUntilDeadline = differenceInHours(deadline, nowInGMT1)
  const isDeadlineClose = hoursUntilDeadline <= 72 // 3 days in hours

  // Format the deadline date
  const formattedDeadline = format(deadline, "MMMM d, yyyy 'at' HH:mm '(GMT+1)'")

  return (
    <div className={`space-y-1 ${isDeadlineClose ? 'text-red-600' : 'text-gray-600'}`}>
      <div className='flex items-center space-x-2'>
        <Clock className='h-4 w-4 flex-shrink-0' />
        <p className='text-sm font-medium'>Apply by {formattedDeadline}</p>
      </div>
      <p className={`text-xs ${isDeadlineClose ? 'font-semibold' : ''} pl-6`}>
        {hoursUntilDeadline > 0
          ? `${Math.floor(hoursUntilDeadline / 24)} day${Math.floor(hoursUntilDeadline / 24) !== 1 ? 's' : ''} and ${hoursUntilDeadline % 24} hour${
              hoursUntilDeadline % 24 !== 1 ? 's' : ''
            } remaining`
          : 'Deadline passed'}
      </p>
    </div>
  )
}
