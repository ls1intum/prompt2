import { useToast } from '@/hooks/use-toast'
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { deleteApplications } from '../../../../network/mutations/deleteApplications'

export const useDeleteApplications = (): UseMutationResult<void, Error, string[], unknown> => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: (coursePhaseParticipationIDs: string[]) => {
      return deleteApplications(phaseId ?? 'undefined', coursePhaseParticipationIDs)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['application_participations', 'students', phaseId],
      })
      toast({
        title: 'Successfully deleted the applications.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete the applications.',
        variant: 'destructive',
      })
    },
  })

  return mutation
}
