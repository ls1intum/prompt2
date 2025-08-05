import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import {
  createCompetencyMapping,
  deleteCompetencyMapping,
} from '../../../../../network/mutations/competencyMapping'
import { Competency } from '../../../../../interfaces/competency'

export const useUpdateCompetencyMapping = (setError: (error: string | undefined) => void) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      competency,
      newMappedCompetencyId,
      action,
      currentMapping,
    }: {
      competency: Competency
      newMappedCompetencyId: string
      action: 'add' | 'remove' | 'update'
      evaluationType?: 'self' | 'peer'
      currentMapping?: string
    }) => {
      if (action === 'update') {
        // First remove existing mapping if it exists
        if (currentMapping) {
          const removeMapping = {
            fromCompetencyId: currentMapping,
            toCompetencyId: competency.id,
          }
          await deleteCompetencyMapping(phaseId ?? '', removeMapping)
        }

        // Then add the new mapping
        const addMapping = {
          fromCompetencyId: newMappedCompetencyId,
          toCompetencyId: competency.id,
        }
        return createCompetencyMapping(phaseId ?? '', addMapping)
      } else {
        const mapping = {
          fromCompetencyId: newMappedCompetencyId,
          toCompetencyId: competency.id,
        }

        if (action === 'add') {
          return createCompetencyMapping(phaseId ?? '', mapping)
        } else {
          return deleteCompetencyMapping(phaseId ?? '', mapping)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      setError(undefined)
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        const serverError = error.response.data?.error
        setError(serverError)
      } else {
        setError('An unexpected error occurred while updating competency mapping.')
      }
    },
  })
}
