import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { AssessmentType } from '../../interfaces/assessmentType'
import { CategoryWithCompetencies } from '../../interfaces/category'

import { getAllCategoriesWithCompetencies } from '../../network/queries/getAllCategoriesWithCompetencies'

export const useGetAllCategoriesWithCompetencies = (options?: { enabled?: boolean }) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<CategoryWithCompetencies[]>({
    queryKey: ['categories', phaseId],
    queryFn: () => getAllCategoriesWithCompetencies(phaseId ?? '', AssessmentType.ASSESSMENT),
    enabled: options?.enabled ?? true,
  })
}
