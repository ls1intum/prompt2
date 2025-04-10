import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getRemainingAssessmentsForStudent } from '../../../network/queries/getRemainingAssessmentsForStudent'
import { RemainingAssessmentsForStudent } from '../../../interfaces/assessment'

export const useGetRemainingAssessmentsForStudent = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { courseParticipationID } = useParams<{ courseParticipationID: string }>()

  return useQuery<RemainingAssessmentsForStudent>({
    queryKey: ['remaining-assessments', phaseId, courseParticipationID],
    queryFn: () => getRemainingAssessmentsForStudent(phaseId ?? '', courseParticipationID ?? ''),
  })
}
