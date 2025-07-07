import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Evaluation } from '../interfaces/evaluation'
import { getMyEvaluations } from '../network/queries/getMyEvaluations'

export const useGetMyEvaluations = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<Evaluation[]>({
    queryKey: ['my-evaluations', phaseId],
    queryFn: () => getMyEvaluations(phaseId ?? ''),
  })
}
