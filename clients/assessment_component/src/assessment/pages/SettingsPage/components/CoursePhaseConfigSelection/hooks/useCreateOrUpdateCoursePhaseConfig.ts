import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { createOrUpdateCoursePhaseConfig } from '../../../../../network/mutations/createOrUpdateCoursePhaseConfig'
import { CreateOrUpdateCoursePhaseConfigRequest } from '../../../../../interfaces/coursePhaseConfig'

export const useCreateOrUpdateCoursePhaseConfig = (setError: (error: string | null) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateOrUpdateCoursePhaseConfigRequest) =>
      createOrUpdateCoursePhaseConfig(phaseId ?? '', request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coursePhaseConfig', phaseId] })
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
