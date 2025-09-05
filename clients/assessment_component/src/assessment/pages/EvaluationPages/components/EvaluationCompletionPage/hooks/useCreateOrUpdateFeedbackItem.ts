import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { CreateOrUpdateFeedbackItemRequest } from '../../../../../interfaces/feedbackItem'
import { createOrUpdateFeedbackItem } from '../../../../../network/mutations/createOrUpdateFeedbackItem'

export const useCreateOrUpdateFeedbackItem = (setError: (error: string | undefined) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feedbackItem: CreateOrUpdateFeedbackItemRequest) => {
      return createOrUpdateFeedbackItem(phaseId ?? '', feedbackItem)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feedback-items', phaseId] })
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
