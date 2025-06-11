import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { createAssessmentTemplate } from '../../../network/mutations/createAssessmentTemplate'
import { CreateAssessmentTemplateRequest } from '../../../interfaces/assessmentTemplate'

export const useCreateAssessmentTemplate = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assessmentTemplate: CreateAssessmentTemplateRequest) =>
      createAssessmentTemplate(phaseId ?? '', assessmentTemplate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessmentTemplates'] })
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
