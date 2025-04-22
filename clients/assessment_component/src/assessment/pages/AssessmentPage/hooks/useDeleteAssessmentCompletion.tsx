import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { deleteAssessmentCompletion } from '../../../network/mutations/deleteAssessmentCompletion'

export const useDeleteAssessmentCompletion = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseParticipationID: string) =>
      deleteAssessmentCompletion(phaseId ?? '', courseParticipationID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments', phaseId] })
      queryClient.invalidateQueries({ queryKey: ['scoreLevels', phaseId] })
      console.log('Assessment completion deleted successfully')
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
