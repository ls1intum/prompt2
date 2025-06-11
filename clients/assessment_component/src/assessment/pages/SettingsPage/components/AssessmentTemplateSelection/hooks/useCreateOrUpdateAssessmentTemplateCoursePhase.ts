import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createOrUpdateAssessmentTemplateCoursePhase } from '../../../../../network/mutations/createOrUpdateAssessmentTemplateCoursePhase'
import { CreateOrUpdateAssessmentTemplateCoursePhaseRequest } from '../../../../../interfaces/assessmentTemplate'

export const useCreateOrUpdateAssessmentTemplateCoursePhase = (
  setError: (error: string | null) => void,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assessmentTemplate: CreateOrUpdateAssessmentTemplateCoursePhaseRequest) =>
      createOrUpdateAssessmentTemplateCoursePhase(assessmentTemplate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessmentTemplates'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['currentAssessmentTemplate'] })
      setError(null)
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        const serverError = error.response.data?.error
        setError(serverError)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    },
  })
}
