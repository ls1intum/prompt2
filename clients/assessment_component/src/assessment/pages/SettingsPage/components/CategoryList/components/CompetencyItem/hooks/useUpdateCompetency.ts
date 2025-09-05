import { useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { UpdateCompetencyRequest } from '../../../../../../../interfaces/competency'
import { updateCompetency } from '../../../../../../../network/mutations/updateCompetency'

export const useUpdateCompetency = (setError: (error: string | undefined) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (competency: UpdateCompetencyRequest) =>
      updateCompetency(phaseId ?? '', competency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
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
