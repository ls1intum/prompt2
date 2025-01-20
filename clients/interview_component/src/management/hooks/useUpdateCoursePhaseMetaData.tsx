import { useToast } from '@/hooks/use-toast'
import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { updateCoursePhase } from '../network/mutations/updateCoursePhase'
import { UpdateCoursePhase } from '@/interfaces/course_phase'

export const useUpdateCoursePhaseMetaData = (): UseMutationResult<
  string | undefined,
  Error,
  UpdateCoursePhase,
  unknown
> => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  // TODO: This requires fixing through a shared library!!!
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: (coursePhase: UpdateCoursePhase) => {
      return updateCoursePhase(coursePhase)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course_phase', phaseId] })
      toast({
        title: 'Success',
        description: 'Successfully updated the interview questions.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update the interview questions.',
        variant: 'destructive',
      })
    },
  })

  return mutation
}
