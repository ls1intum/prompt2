import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getAllStudentAssessmentsInPhase } from '../../../network/queries/getAllStudentAssessmentsInPhase'
import { Assessment } from '../../../interfaces/assessment'

export const useGetAllAssessments = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { courseParticipationID } = useParams<{ courseParticipationID: string }>()

  return useQuery<Assessment[]>({
    queryKey: ['assessments'],
    queryFn: () => getAllStudentAssessmentsInPhase(phaseId ?? '', courseParticipationID ?? ''),
  })
}
