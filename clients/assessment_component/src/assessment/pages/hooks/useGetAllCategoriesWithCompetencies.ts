import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getAllCategoriesWithCompetencies } from '../../network/queries/getAllCategoriesWithCompetencies'
import { CategoryWithCompetencies } from '../../interfaces/category'

export const useGetAllCategoriesWithCompetencies = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<CategoryWithCompetencies[]>({
    queryKey: ['categories'],
    queryFn: () => getAllCategoriesWithCompetencies(phaseId ?? ''),
  })
}
