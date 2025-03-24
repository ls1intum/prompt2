import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { createRepository } from '../../network/mutations/createRepository'
import { useDevOpsChallengeStore } from '../../zustand/useDevOpsChallengeStore'

export const useCreateRepository = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gitHubHandle?: string) => createRepository(gitHubHandle ?? '', phaseId ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devOpsDeveloperProfile', phaseId] })
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
