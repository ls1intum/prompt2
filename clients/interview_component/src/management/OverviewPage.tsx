import { cn } from '@/lib/utils'
import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { StudentCard } from './components/StudentCard'
import { useParticipationStore } from './zustand/useParticipationStore'
import { useLocation, useNavigate } from 'react-router-dom'
import { useScreenSize } from '@/hooks/useScreenSize'

export const OverviewPage = (): JSX.Element => {
  const { participations } = useParticipationStore()
  const navigate = useNavigate()
  const path = useLocation().pathname
  const { width } = useScreenSize() // use this for more fine-grained control over the layout

  return (
    <div>
      <ManagementPageHeader>Interview</ManagementPageHeader>
      <div
        className={cn(
          'grid gap-2 mt-8',
          width >= 1500 ? 'grid-cols-4' : width >= 1200 ? 'grid-cols-3' : 'grid-cols-2',
        )}
      >
        {participations?.map((participation) => (
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
