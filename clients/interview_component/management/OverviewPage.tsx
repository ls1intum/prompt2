import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { StudentCard } from './components/StudentCard'
import { useParticipationStore } from './zustand/useParticipationStore'

export const OverviewPage = (): JSX.Element => {
  const { participations } = useParticipationStore()

  return (
    <div className='w-full'>
      <ManagementPageHeader>Interview</ManagementPageHeader>
      <div className='grid grid-cols-3  gap-2 mt-8 cursor-pointer'>
        {participations?.map((participation) => (
          <StudentCard key={participation.student.last_name} participation={participation} />
        ))}
      </div>
    </div>
  )
}

export default OverviewPage
