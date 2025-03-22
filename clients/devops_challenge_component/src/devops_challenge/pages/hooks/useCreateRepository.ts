import { useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { createRepository } from '../../network/mutations/createRepository'

export const useCreateRepository = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useMutation({
    mutationFn: (gitHubHandle?: string) => createRepository(gitHubHandle ?? '', phaseId ?? ''),
    onSuccess: () => {
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