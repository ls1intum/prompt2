import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn, ManagementPageHeader, useScreenSize } from '@tumaet/prompt-ui-components'
import { StudentCard } from '../../components/StudentCard'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { SortDropdownMenu } from '../../components/SortDropdownMenu'
import { InterviewTimesDialog } from '../../components/InterviewTimesDialog'
import { useSorting } from '../../hooks/useSorting'

export const OverviewPage = (): JSX.Element => {
  const { interviewSlots } = useParticipationStore()
  const navigate = useNavigate()
  const path = useLocation().pathname
  const { width } = useScreenSize() // use this for more fine-grained control over the layout
  const [sortBy, setSortBy] = useState<string | undefined>('Interview Date')
  const orderedParticipations = useSorting(sortBy)

  return (
    <div>
      <ManagementPageHeader>Interview</ManagementPageHeader>
      <div className='flex justify-between items-center mt-4 mb-6'>
        <div className='flex space-x-2'>
          <SortDropdownMenu sortBy={sortBy} setSortBy={setSortBy} />
          <InterviewTimesDialog />
        </div>
      </div>
      <div
        className={cn(
          'grid gap-2 mt-8',
          width >= 1500 ? 'grid-cols-4' : width >= 1200 ? 'grid-cols-3' : 'grid-cols-2',
        )}
      >
        {orderedParticipations?.map((participation) => (
          <div
            key={participation.student.email}
            onClick={() => navigate(`${path}/details/${participation.student.id}`)}
            className='cursor-pointer'
          >
            <StudentCard
              participation={participation}
              interviewSlot={interviewSlots.find(
                (slot) => slot.courseParticipationID === participation.courseParticipationID,
              )}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default OverviewPage
