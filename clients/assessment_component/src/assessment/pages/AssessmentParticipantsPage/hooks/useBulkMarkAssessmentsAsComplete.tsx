import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '@tumaet/prompt-shared-state'
import { bulkMarkAssessmentsAsComplete } from '../../../network/mutations/bulkMarkAssessmentsAsComplete'
import { AssessmentParticipationWithStudent } from '../../../interfaces/assessmentParticipationWithStudent'

export const useBulkMarkAssessmentsAsComplete = (
  setError: (error: string | undefined) => void,
  participations?: AssessmentParticipationWithStudent[],
) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const replaceIdsWithNames = (errorMessage: string): string => {
    if (!participations) return errorMessage

    let updatedMessage = errorMessage

    participations.forEach((participation) => {
      const fullName = `${participation.student.firstName} ${participation.student.lastName}`
      const regex = new RegExp(participation.courseParticipationID, 'g')
      updatedMessage = updatedMessage.replace(regex, fullName)
    })

    return updatedMessage
  }

  return useMutation({
    mutationFn: (courseParticipationIDs: string[]) => {
      return bulkMarkAssessmentsAsComplete(phaseId ?? '', {
        courseParticipationIDs,
        author: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessmentCompletions', phaseId] })
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        const serverError = error.response.data?.error
        const userFriendlyError = replaceIdsWithNames(serverError)
        setError(userFriendlyError)
      } else {
        setError('An unexpected error occurred while marking assessments as final.')
      }
    },
  })
}
