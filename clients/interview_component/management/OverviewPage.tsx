import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { StudentCard } from './components/StudentCard'
import { useParticipationStore } from './zustand/useParticipationStore'
import { useLocation, useNavigate } from 'react-router-dom'

export const OverviewPage = (): JSX.Element => {
  const { participations } = useParticipationStore()
  const navigate = useNavigate()
  const path = useLocation().pathname

  return (
    <div className='w-full'>
      <ManagementPageHeader>Interview</ManagementPageHeader>
      <div className='grid grid-cols-3  gap-2 mt-8'>
        {participations?.map((participation) => (
          <div
            key={participation.student.last_name}
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
