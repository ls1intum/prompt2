import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getSelfEvaluationCategoriesWithCompetencies } from '../../network/queries/getSelfEvaluationCategoriesWithCompetencies'
import { CategoryWithCompetencies } from '../../interfaces/category'

export const useGetSelfEvaluationCategoriesWithCompetencies = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<CategoryWithCompetencies[]>({
    queryKey: ['selfEvaluationCategories', phaseId],
    queryFn: () => getSelfEvaluationCategoriesWithCompetencies(phaseId ?? ''),
  })
}
