import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Seat } from '../../../interfaces/Seat'
import { createSeatPlan } from 'src/introCourse/network/mutations/createSeatPlan'
import { useParams } from 'react-router-dom'
import { deleteSeatPlan } from 'src/introCourse/network/mutations/deleteSeatPlan'

interface SeatUploaderProps {
  existingSeats: Seat[]
}

export const SeatUploader = ({ existingSeats }: SeatUploaderProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (seatNames: string[]) => {
      return createSeatPlan(phaseId ?? '', seatNames)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seat_plan', phaseId] })
    },
    onError: () => {
      // TODO
    },
  })

  const { mutate: mutateDeleteSeatPlan } = useMutation({
    mutationFn: () => {
      return deleteSeatPlan(phaseId ?? '')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seat_plan', phaseId] })
    },
    onError: () => {
      // TODO
    },
  })

  return <div>This is a seat uploader</div>
}
