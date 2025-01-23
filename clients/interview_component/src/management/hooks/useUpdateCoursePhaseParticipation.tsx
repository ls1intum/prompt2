import { useToast } from '@/hooks/use-toast'
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { UpdateCoursePhaseParticipation } from '@/interfaces/course_phase_participation'
import { updateCoursePhaseParticipation } from '../network/mutations/updateCoursePhaseParticipationMetaData'

export const useUpdateCoursePhaseParticipation = (): UseMutationResult<
  string | undefined,
  Error,
  UpdateCoursePhaseParticipation,
  unknown
> => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  // TODO: This requires fixing through a shared library!!!
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: (coursePhaseParticipation: UpdateCoursePhaseParticipation) => {
      return updateCoursePhaseParticipation(coursePhaseParticipation)
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
