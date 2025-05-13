import { useToast } from '@tumaet/prompt-ui-components'
import { UpdateCourseData } from '@tumaet/prompt-shared-state'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { updateCourseData } from '@core/network/mutations/updateCourseData'

interface SaveMailingDataProps {
  onSuccess?: () => void
}

export const useSaveMailingData = ({ onSuccess }: SaveMailingDataProps) => {
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
      onSuccess?.()
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
