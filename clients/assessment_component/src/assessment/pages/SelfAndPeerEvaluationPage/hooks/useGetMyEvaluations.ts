import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { Evaluation } from '../../../interfaces/evaluation'

import { getMyEvaluations } from '../../../network/queries/getMyEvaluations'

export const useGetMyEvaluations = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const { data: evaluations, ...queryInfo } = useQuery<Evaluation[]>({
    queryKey: ['my-evaluations', phaseId],
    queryFn: () => getMyEvaluations(phaseId ?? ''),
  })

  const selfEvaluations =
    evaluations?.filter(
      (evaluation) => evaluation.courseParticipationID === evaluation.authorCourseParticipationID,
    ) || []
  const peerEvaluations =
    evaluations?.filter(
      (evaluation) => evaluation.courseParticipationID === evaluation.authorCourseParticipationID,
    ) || []

  return {
    selfEvaluations,
    peerEvaluations,
    evaluations: evaluations || [],
    ...queryInfo,
  }
}
