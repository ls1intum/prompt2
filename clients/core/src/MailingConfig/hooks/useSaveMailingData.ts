import { useToast } from '@/hooks/use-toast'
import { UpdateCourseData } from '@tumaet/prompt-shared-state'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { updateCourseData } from '../../network/mutations/updateCourseData'

export const useSaveMailingData = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { courseId } = useParams<{ courseId: string }>()

  const mutation = useMutation({
    mutationFn: (courseData: UpdateCourseData) => {
      return updateCourseData(courseId ?? 'undefined', courseData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast({
        title: 'Successfully Stored Mailing Settings',
      })
    },
    onError: () => {
      toast({
        title: 'Failed to Store Mailing Settings',
        description: 'Please try again later!',
        variant: 'destructive',
      })
    },
  })

  return mutation
}
