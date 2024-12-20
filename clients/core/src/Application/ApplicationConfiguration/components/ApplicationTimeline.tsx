import { differenceInDays, format } from 'date-fns'
import { Progress } from '@/components/ui/progress'

interface ApplicationTimelineProps {
  startDate: Date | undefined
  endDate: Date | undefined
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({
  startDate,
  endDate,
}: ApplicationTimelineProps) => {
  if (!startDate || !endDate) return <div>Unknown Dates</div>

  const totalDays = differenceInDays(endDate, startDate)
  const today = new Date()
  const daysPassed = differenceInDays(today, startDate)
  const progress = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100)

  return (
    <div className='space-y-2'>
      <div className='flex justify-between text-sm text-gray-500'>
        <span>{format(startDate, 'MMM d, yyyy')}</span>
        <span>{format(endDate, 'MMM d, yyyy')}</span>
      </div>
      <Progress value={progress} className='w-full' />
      <div className='text-center text-sm text-gray-500'>
        {progress <= 0 ? (
          <span>Application period starts in {-daysPassed} days</span>
        ) : progress >= 100 ? (
          <span>Application period has ended</span>
        ) : (
          <span>{totalDays - daysPassed} days remaining</span>
        )}
      </div>
    </div>
  )
}
