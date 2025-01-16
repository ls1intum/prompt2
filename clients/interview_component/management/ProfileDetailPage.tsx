import { useNavigate, useParams } from 'react-router-dom'
import { useParticipationStore } from './zustand/useParticipationStore'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { StudentCard } from './components/StudentCard'

export const ProfileDetailPage = (): JSX.Element => {
  const { studentId } = useParams<{ studentId: string }>()
  const { participations } = useParticipationStore()
  const participation = participations.find((p) => p.student.id === studentId)
  const navigate = useNavigate()

  return (
    <div className=''>
      <div className='relative pb-4'>
        <Button
          onClick={() => navigate(-1)}
          variant='ghost'
          size='sm'
          className='absolute top-0 left-0'
        >
          <ChevronLeft className='h-4 w-4' />
          <span>Back</span>
        </Button>
        {!participation && (
          <div className='flex justify-center items-center h-64'>
            <p className='text-lg text-muted-foreground'>Participant not found</p>
          </div>
        )}
      </div>
      {participation && (
        <div className='pt-6'>
          <StudentCard participation={participation} />
        </div>
      )}
    </div>
  )
}
