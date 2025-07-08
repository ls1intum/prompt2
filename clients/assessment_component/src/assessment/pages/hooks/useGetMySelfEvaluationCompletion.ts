import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { EvaluationCompletion } from '../../interfaces/evaluationCompletion'
import { getMySelfEvaluationCompletion } from '../../network/queries/getMySelfEvaluationCompletion'

export const useGetMySelfEvaluationCompletion = (options?: { enabled?: boolean }) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<EvaluationCompletion>({
    queryKey: ['my-self-evaluation-completion', phaseId],
    queryFn: () => getMySelfEvaluationCompletion(phaseId ?? ''),
    enabled: options?.enabled,
  })
}
