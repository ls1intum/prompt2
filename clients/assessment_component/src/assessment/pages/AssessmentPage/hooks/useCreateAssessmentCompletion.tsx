import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { createAssessmentCompletion } from '../../../network/mutations/createAssessmentCompletion'
import { AssessmentCompletion } from '../../../interfaces/assessment'

export const useCreateAssessmentCompletion = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assessmentCompletion: AssessmentCompletion) => {
      return createAssessmentCompletion(phaseId ?? '', assessmentCompletion)
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
