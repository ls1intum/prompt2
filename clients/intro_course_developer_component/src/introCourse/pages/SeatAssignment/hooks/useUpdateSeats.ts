import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Seat } from '../../../interfaces/Seat'
import { updateSeatPlan } from '../../../network/mutations/updateSeatPlan'

export const useUpdateSeats = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updatedSeats: Seat[]) => updateSeatPlan(phaseId ?? '', updatedSeats),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seatPlan', phaseId] })
      setError(null)
    },
    onError: () => {
      setError('Failed to update. Please try again.')
    },
  })
}
