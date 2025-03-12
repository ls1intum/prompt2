import { ManagementPageHeader } from '@/components/ManagementPageHeader'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Tutor } from 'src/introCourse/interfaces/Tutor'
import { getAllTutors } from 'src/introCourse/network/queries/getAllTutors'

export const SeatAssignmentPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const {
    data: tutors,
    isLoading: isLoading,
    isError: isTutorsLoadingError,
  } = useQuery<Tutor[]>({
    queryKey: ['tutors', phaseId],
    queryFn: () => getAllTutors(phaseId ?? ''),
  })

  

  return (
    <div>
      <ManagementPageHeader>Seat Assignment</ManagementPageHeader>
    </div>
  )
}
