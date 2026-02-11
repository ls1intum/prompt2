import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getAllCategoriesWithCompetencies } from '../../network/queries/getAllCategoriesWithCompetencies'

import { AssessmentType } from '../../interfaces/assessmentType'
import { CategoryWithCompetencies } from '../../interfaces/category'

export const useGetSelfEvaluationCategoriesWithCompetencies = (enabled: boolean = true) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<CategoryWithCompetencies[]>({
    queryKey: ['selfEvaluationCategories', phaseId],
    queryFn: () => getAllCategoriesWithCompetencies(phaseId ?? '', AssessmentType.SELF),
    enabled: enabled,
  })
}
