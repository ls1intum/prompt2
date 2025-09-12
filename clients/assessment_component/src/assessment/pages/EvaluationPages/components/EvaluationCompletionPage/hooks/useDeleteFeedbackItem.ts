import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { deleteFeedbackItem } from '../../../../../network/mutations/deleteFeedbackItem'

export const useDeleteFeedbackItem = (setError: (error: string | undefined) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (feedbackItemID: string) => {
      return deleteFeedbackItem(phaseId ?? '', feedbackItemID)
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
