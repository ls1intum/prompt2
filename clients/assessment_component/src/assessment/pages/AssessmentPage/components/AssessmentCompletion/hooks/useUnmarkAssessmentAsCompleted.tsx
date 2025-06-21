import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { unmarkAssessmentAsCompleted } from '../../../../../network/mutations/unmarkAssessmentAsCompleted'

export const useUnmarkAssessmentAsCompleted = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseParticipationID: string) => {
      return unmarkAssessmentAsCompleted(phaseId ?? '', courseParticipationID)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', phaseId] })
      queryClient.invalidateQueries({ queryKey: ['scoreLevels', phaseId] })
      queryClient.invalidateQueries({ queryKey: ['assessmentCompletions', phaseId] })
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
