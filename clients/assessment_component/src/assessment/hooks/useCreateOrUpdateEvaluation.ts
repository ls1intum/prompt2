import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { CreateOrUpdateEvaluationRequest } from '../interfaces/evaluation'
import { createOrUpdateEvaluation } from '../network/mutations/createOrUpdateEvaluation'

export const useCreateOrUpdateEvaluation = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (evaluation: CreateOrUpdateEvaluationRequest) =>
      createOrUpdateEvaluation(phaseId ?? '', evaluation),
    onSuccess: () => {
      // Invalidate and refetch my evaluations
      queryClient.invalidateQueries({ queryKey: ['my-evaluations', phaseId] })
    },
    onError: (error) => {
      console.error('Error creating or updating evaluation:', error)
    },
  })
}
