import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getAllAssessmentsInPhase } from '../../network/queries/getAllAssessmentsInPhase'
import { Assessment } from '../../interfaces/assessment'

export const useGetAllAssessments = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<Assessment[]>({
    queryKey: ['assessments', phaseId],
    queryFn: () => getAllAssessmentsInPhase(phaseId ?? ''),
  })
}
