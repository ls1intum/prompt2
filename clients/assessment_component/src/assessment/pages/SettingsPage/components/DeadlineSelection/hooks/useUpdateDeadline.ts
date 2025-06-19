import { useParams } from 'react-router-dom'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateDeadline } from '../../../../../network/mutations/updateDeadline'

export const useUpdateDeadline = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: Date) => updateDeadline(phaseId ?? '', request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadline'] })
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
