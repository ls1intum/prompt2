import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { deleteCompetency } from '../../../network/mutations/deleteCompetency'

export const useDeleteCompetency = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (competencyID: string) => deleteCompetency(phaseId ?? '', competencyID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competencies'] })
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
