import { useToast } from '@tumaet/prompt-ui-components'
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { UpdateCoursePhaseParticipation } from '@tumaet/prompt-shared-state'
import { updateCoursePhaseParticipationBatch } from '@/network/mutations/updateCoursePhaseParticipationBatch'

export const useUpdateCoursePhaseParticipationBatch = (): UseMutationResult<
  void,
  Error,
  UpdateCoursePhaseParticipation[],
  unknown
> => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  // TODO: This requires fixing through a shared library!!!
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: (coursePhaseParticipations: UpdateCoursePhaseParticipation[]) => {
      return updateCoursePhaseParticipationBatch(phaseId ?? '', coursePhaseParticipations)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants', phaseId] })
      toast({
        title: 'Success',
        description: 'Successfully updated the course participation.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update the course participation.',
        variant: 'destructive',
      })
    },
  })

  return mutation
}
