import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { updateCompetency } from '../../../network/mutations/updateCompetency'
import { UpdateCompetencyRequest } from '../../../interfaces/competency'

export const useUpdateCompetency = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (competency: UpdateCompetencyRequest) =>
      updateCompetency(phaseId ?? '', competency),
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
