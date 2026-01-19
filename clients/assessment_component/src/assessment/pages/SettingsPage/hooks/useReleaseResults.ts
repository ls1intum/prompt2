import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { releaseResults } from '../../../network/mutations/releaseResults'

export const useReleaseResults = () => {
  const queryClient = useQueryClient()
  const { phaseId } = useParams<{ phaseId: string }>()

  const mutation = useMutation({
    mutationFn: () => releaseResults(phaseId ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coursePhaseConfig', phaseId] })
    },
  })

  return mutation
}
