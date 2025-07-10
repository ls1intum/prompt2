import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getPeerEvaluationCategoriesWithCompetencies } from '../../network/queries/getPeerEvaluationCategoriesWithCompetencies'
import { CategoryWithCompetencies } from '../../interfaces/category'

export const useGetPeerEvaluationCategoriesWithCompetencies = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<CategoryWithCompetencies[]>({
    queryKey: ['peerEvaluationCategories', phaseId],
    queryFn: () => getPeerEvaluationCategoriesWithCompetencies(phaseId ?? ''),
  })
}
