import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { deleteActionItem } from '../../../../../network/mutations/deleteActionItem'

export const useDeleteActionItem = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (actionItemId: string) => deleteActionItem(phaseId ?? '', actionItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems', phaseId] })
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
