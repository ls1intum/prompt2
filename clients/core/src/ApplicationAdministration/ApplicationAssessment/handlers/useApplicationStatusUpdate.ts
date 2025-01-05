import { useToast } from '@/hooks/use-toast'
import { UpdateApplicationStatus } from '@/interfaces/update_application_status'
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { updateApplicationStatus } from '../../../network/mutations/updateApplicationStatus'
import { useParams } from 'react-router-dom'

export const useApplicationStatusUpdate = (): UseMutationResult<
  void,
  Error,
  UpdateApplicationStatus,
  unknown
> => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: (updateApplication: UpdateApplicationStatus) => {
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
