import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { createActionItem } from '../../../../../network/mutations/createActionItem'
import { CreateActionItemRequest } from '../../../../../interfaces/actionItem'

export const useCreateActionItem = (setError: (error: string | undefined) => void) => {
  const { phaseId } = useParams<{
    phaseId: string
  }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (actionItem: CreateActionItemRequest) => {
      return createActionItem(phaseId ?? '', actionItem)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionItems', phaseId] })
      setError(undefined)
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
