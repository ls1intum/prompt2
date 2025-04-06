import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getRemainingAssessmentsForStudent } from '../../../network/queries/getRemainingAssessmentsForStudent'

export const useRemainingAssessmentsForStudent = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { courseParticipationID } = useParams<{ courseParticipationID: string }>()

  return useQuery<number>({
    queryKey: ['remaining-assessments', phaseId, courseParticipationID],
    queryFn: () => getRemainingAssessmentsForStudent(phaseId ?? '', courseParticipationID ?? ''),
    enabled: !!phaseId && !!courseParticipationID,
  })
}
