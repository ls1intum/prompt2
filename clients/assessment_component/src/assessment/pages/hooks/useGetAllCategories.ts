import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getAllCategories } from '../../network/queries/getAllCategories'
import { Category } from '../../interfaces/category'

export const useGetAllCategories = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => getAllCategories(phaseId ?? ''),
  })
}
