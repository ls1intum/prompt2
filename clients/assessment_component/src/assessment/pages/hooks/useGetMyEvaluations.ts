import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Evaluation } from '../../interfaces/evaluation'

import { getMyEvaluations } from '../../network/queries/getMyEvaluations'

export const useGetMyEvaluations = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const { data, ...queryInfo } = useQuery<Evaluation[]>({
    queryKey: ['my-evaluations', phaseId],
    queryFn: () => getMyEvaluations(phaseId ?? ''),
  })

  const evaluations = useMemo(() => data || [], [data])

  const selfEvaluations = useMemo(
    () =>
      evaluations.filter(
        (evaluation) => evaluation.courseParticipationID === evaluation.authorCourseParticipationID,
      ),
    [evaluations],
  )

  const peerEvaluations = useMemo(
    () =>
      evaluations.filter(
        (evaluation) => evaluation.courseParticipationID !== evaluation.authorCourseParticipationID,
      ),
    [evaluations],
  )

  return {
    selfEvaluations,
    peerEvaluations,
    evaluations,
    ...queryInfo,
  }
}
