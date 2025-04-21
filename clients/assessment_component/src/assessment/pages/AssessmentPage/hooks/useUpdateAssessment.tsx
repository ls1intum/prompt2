import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { updateAssessment } from '../../../network/mutations/createOrUpdateAssessment'
import { CreateOrUpdateAssessmentRequest } from '../../../interfaces/assessment'

export const useUpdateAssessment = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assessment: CreateOrUpdateAssessmentRequest) => {
      return updateAssessment({
        ...assessment,
        coursePhaseID: phaseId ?? '',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', phaseId] })
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
