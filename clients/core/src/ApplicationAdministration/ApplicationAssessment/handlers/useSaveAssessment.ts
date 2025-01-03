import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postApplicationAssessment } from '../../../network/mutations/postApplicationAssessment'
import { ApplicationAssessment } from '@/interfaces/application_assessment'

const useSaveAssessment = (phaseId: string, phaseParticipationID: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (applicationAssessment: ApplicationAssessment) => {
      return postApplicationAssessment(phaseId, phaseParticipationID, applicationAssessment)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application_participations'] })
    },
    onError: () => {
      // Handle error
    },
  })
}

export default useSaveAssessment
