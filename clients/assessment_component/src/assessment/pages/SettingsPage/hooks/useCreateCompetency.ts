import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { createCompetency } from '../../../network/mutations/createCompetency'
import { CreateCompetencyRequest } from '../../../interfaces/competency'

export const useCreateCompetency = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (competency: CreateCompetencyRequest) =>
      createCompetency(phaseId ?? '', competency),
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
