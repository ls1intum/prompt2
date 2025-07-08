import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@tumaet/prompt-ui-components'
import { copyCourse } from '@core/network/mutations/copyCourse'
import { checkCourseCopyable } from '@core/network/mutations/checkCourseCopyable'
import type { CopyCourse } from '../../managementConsole/courseOverview/interfaces/copyCourse'
import type { CopyCourseFormValues } from '@core/validations/copyCourse'
import type { DialogStep } from '../../managementConsole/courseOverview/interfaces/copyCourseDialogProps'

export const useCopyCourse = (
  courseId: string,
  currentStep: DialogStep,
  onClose: () => void,
  setCurrentStep: (step: DialogStep) => void,
) => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Query to check if course is copyable
  const {
    data: copyabilityData,
    isLoading: isCheckingCopyability,
    error: copyabilityError,
  } = useQuery({
    queryKey: ['course-copyability', courseId],
    queryFn: () => checkCourseCopyable(courseId),
    enabled: currentStep === 'warning' && !!courseId,
  })

  const { mutate: mutateCopyCourse, isPending: isCopying } = useMutation({
    mutationFn: (courseData: CopyCourse) => {
      return copyCourse(courseId ?? '', courseData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast({
        title: 'Successfully Copied Course',
      })
      navigate('/management/general')
      onClose()
    },
    onError: () => {
      toast({
        title: 'Failed to Copy Course',
        description: 'Please try again later!',
        variant: 'destructive',
      })
      setCurrentStep('form')
    },
  })

  const handleProceedWithCopy = (formData: CopyCourseFormValues) => {
    const copyData: CopyCourse = {
      name: formData.name,
      semesterTag: formData.semesterTag,
      startDate: formData.dateRange.from,
      endDate: formData.dateRange.to,
    }
    mutateCopyCourse(copyData)
  }

  return {
    copyabilityData,
    isCheckingCopyability,
    copyabilityError,
    isCopying,
    handleProceedWithCopy,
    queryClient,
  }
}
