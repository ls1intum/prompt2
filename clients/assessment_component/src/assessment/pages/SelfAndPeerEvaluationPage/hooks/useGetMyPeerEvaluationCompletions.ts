import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { EvaluationCompletion } from '../../../interfaces/evaluationCompletion'
import { getMyPeerEvaluationCompletions } from '../../../network/queries/getMyPeerEvaluationCompletions'

export const useGetMyPeerEvaluationCompletions = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<EvaluationCompletion[]>({
    queryKey: ['my-peer-evaluation-completions', phaseId],
    queryFn: () => getMyPeerEvaluationCompletions(phaseId ?? ''),
  })
}
