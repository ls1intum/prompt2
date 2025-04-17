import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { createCategory } from '../../../network/mutations/createCategory'
import { CreateCategoryRequest } from '../../../interfaces/category'

export const useCreateCategory = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (category: CreateCategoryRequest) => createCategory(phaseId ?? '', category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      setError(null)
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        const serverError = error.response.data?.error
        setError(serverError)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    },
  })
}
