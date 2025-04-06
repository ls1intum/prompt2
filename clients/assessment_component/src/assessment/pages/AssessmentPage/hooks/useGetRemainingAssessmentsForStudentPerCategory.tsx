import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { getRemainingAssessmentsForStudentPerCategory } from '../../../network/queries/getRemainingAssessmentsForStudentPerCategory'
import { CategoryWithRemainingAssessments } from '../../../interfaces/category'

export const useGetRemainingAssessmentsForStudentPerCategory = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { courseParticipationID } = useParams<{ courseParticipationID: string }>()

  return useQuery<CategoryWithRemainingAssessments[]>({
    queryKey: ['remaining-assessments-per-category', phaseId, courseParticipationID],
    queryFn: () =>
      getRemainingAssessmentsForStudentPerCategory(phaseId ?? '', courseParticipationID ?? ''),
  })
}
