import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getRemainingAssessmentsForStudentInCategory } from '../../../network/queries/getRemainingAssessmentsForStudentInCategory'

export const useRemainingAssessmentsForStudentInCategory = (categoryID: string) => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { courseParticipationID } = useParams<{ courseParticipationID: string }>()

  return useQuery<number>({
    queryKey: ['remaining-assessments-category', phaseId, courseParticipationID, categoryID],
    queryFn: () =>
      getRemainingAssessmentsForStudentInCategory(
        phaseId ?? '',
        courseParticipationID ?? '',
        categoryID ?? '',
      ),
    enabled: !!phaseId && !!courseParticipationID && !!categoryID,
  })
}
