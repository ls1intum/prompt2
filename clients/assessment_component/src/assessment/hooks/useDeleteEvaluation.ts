import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { deleteEvaluation } from '../network/mutations/deleteEvaluation'

export const useDeleteEvaluation = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (evaluationID: string) => deleteEvaluation(phaseId ?? '', evaluationID),
    onSuccess: () => {
      // Invalidate and refetch my evaluations
      queryClient.invalidateQueries({ queryKey: ['my-evaluations', phaseId] })
    },
    onError: (error) => {
      console.error('Error deleting evaluation:', error)
    },
  })
}
