import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { createAssessment } from '../../../network/mutations/createAssessment'
import { CreateOrUpdateAssessmentRequest } from '../../../interfaces/assessment'

export const useCreateAssessment = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assessment: CreateOrUpdateAssessmentRequest) =>
      createAssessment(phaseId ?? '', assessment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
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
