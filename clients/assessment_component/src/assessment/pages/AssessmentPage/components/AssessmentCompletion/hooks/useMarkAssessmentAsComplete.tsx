import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { markAssessmentAsComplete } from '../../../../../network/mutations/markAssessmentAsComplete'
import { CreateOrUpdateAssessmentCompletionRequest } from '../../../../../interfaces/assessmentCompletion'

export const useMarkAssessmentAsComplete = (setError: (error: string | undefined) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assessmentCompletion: CreateOrUpdateAssessmentCompletionRequest) => {
      return markAssessmentAsComplete(phaseId ?? '', assessmentCompletion)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', phaseId] })
      queryClient.invalidateQueries({ queryKey: ['scoreLevels', phaseId] })
      queryClient.invalidateQueries({ queryKey: ['assessmentCompletions', phaseId] })
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
