import { differenceInHours, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { Clock } from 'lucide-react'

export const DeadlineInfo = ({ deadline }: { deadline: Date }): JSX.Element => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone // Get the user's current timezone
  const berlinTimeZone = 'Europe/Berlin'
  const now = new Date()

  // Check if the deadline is in Europe/Berlin timezone
  const deadlineInBerlin = toZonedTime(deadline, berlinTimeZone)

  // Format the deadline for display
  const formattedDeadline =
    userTimeZone === berlinTimeZone
      ? format(deadline, "MMMM d, yyyy 'at' HH:mm")
      : format(deadlineInBerlin, "MMMM d, yyyy 'at' HH:mm '(Europe/Berlin)'")

  // Calculate the time difference in the user's timezone
  const hoursUntilDeadline = differenceInHours(deadline, now)

  const isDeadlineClose = hoursUntilDeadline <= 72 // 3 days in hours

  const hoursString = `${Math.floor(hoursUntilDeadline / 24)} day${
    Math.floor(hoursUntilDeadline / 24) !== 1 ? 's' : ''
  }`

  const minuteString = isDeadlineClose
    ? ` and ${hoursUntilDeadline % 24} hour${hoursUntilDeadline % 24 !== 1 ? 's' : ''}`
    : ''

  return (
    <div className={`space-y-1 ${isDeadlineClose ? 'text-red-600' : 'text-gray-600'}`}>
      <div className='flex items-center space-x-2'>
        <Clock className='h-4 w-4 flex-shrink-0' />
        <p className='text-sm font-medium'>Apply by {formattedDeadline}</p>
      </div>
      <p className={`text-xs ${isDeadlineClose ? 'font-semibold' : ''} pl-6`}>
        {hoursUntilDeadline > 0 ? `${hoursString}${minuteString} remaining` : 'Deadline passed'}
      </p>
    </div>
  )
}
