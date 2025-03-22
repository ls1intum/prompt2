import { useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { triggerAssessment } from '../../network/mutations/triggerAssessment'

export const useTriggerAssessment = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useMutation({
    mutationFn: (gitHubHandle?: string) => triggerAssessment(gitHubHandle ?? '', phaseId ?? ''),
    onSuccess: () => {
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
