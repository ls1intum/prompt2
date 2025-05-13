import { useToast } from '@tumaet/prompt-ui-components'
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { updateApplicationStatus } from '@core/network/mutations/updateApplicationStatus'
import { useParams } from 'react-router-dom'
import { UpdateCoursePhaseParticipationStatus } from '@tumaet/prompt-shared-state'

export const useApplicationStatusUpdate = (): UseMutationResult<
  void,
  Error,
  UpdateCoursePhaseParticipationStatus,
  unknown
> => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: (updateApplication: UpdateCoursePhaseParticipationStatus) => {
      return updateApplicationStatus(phaseId ?? 'undefined', updateApplication)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['application_participations', 'students', phaseId],
      })
      toast({
        title: 'Successfully updated the status.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update the status.',
        variant: 'destructive',
      })
    },
  })

  return mutation
}
