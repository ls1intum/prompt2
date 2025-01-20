import { cn } from '@/lib/utils'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { StudentCard } from './components/StudentCard'
import { useParticipationStore } from './zustand/useParticipationStore'
import { useLocation, useNavigate } from 'react-router-dom'
import { useScreenSize } from '@/hooks/useScreenSize'
import { Button } from '@/components/ui/button'
import { ClipboardList, Clock } from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'
import { SortDropdownMenu } from './components/SortDropdownMenu'
import { PassStatus } from '@/interfaces/course_phase_participation'

export const OverviewPage = (): JSX.Element => {
  const { participations } = useParticipationStore()
  const navigate = useNavigate()
  const path = useLocation().pathname
  const { width } = useScreenSize() // use this for more fine-grained control over the layout
  const [sortBy, setSortBy] = useState<string | undefined>(undefined)

  const orderedParticipations = useMemo(() => {
    if (!sortBy) return participations
    return participations.sort((a, b) => {
      switch (sortBy) {
        case 'First Name':
          console.log('a:', a.student.first_name)
          console.log('b:', b.student.first_name)
          return a.student.first_name.localeCompare(b.student.first_name)
        case 'Last Name':
          return a.student.last_name.localeCompare(b.student.last_name)
        case 'Acceptance Status':
          const statusOrder = [PassStatus.PASSED, PassStatus.NOT_ASSESSED, PassStatus.FAILED]

          return (
            (statusOrder.indexOf(a.pass_status) || 0) - (statusOrder.indexOf(b.pass_status) || 0)
          )
        // case 'Interview Date':
        //   return new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime()
        default:
          return 0
      }
    })
  }, [participations, sortBy])

  useEffect(() => {
    console.log('Sort by:', sortBy)
  }, [sortBy])

  return (
    <div>
      <ManagementPageHeader>Interview</ManagementPageHeader>
      <div className='flex justify-between items-center mt-4 mb-6'>
        <div className='flex space-x-2'>
          <SortDropdownMenu sortBy={sortBy} setSortBy={setSortBy} />

          <Button variant='outline'>
            <Clock className='h-4 w-4' />
            Set Interview Times
          </Button>
          <Button variant='outline'>
            <ClipboardList className='h-4 w-4' />
            Set Interview Questions
          </Button>
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
            <StudentCard participation={participation} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default OverviewPage
