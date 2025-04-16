import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getStudentAssessment } from '../../../network/queries/getStudentAssessment'
import { StudentAssessment } from '../../../interfaces/studentAssessment'

export const useGetStudentAssessment = () => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const { courseParticipationID } = useParams<{ courseParticipationID: string }>()

  return useQuery<StudentAssessment>({
    queryKey: ['assessments', phaseId],
    queryFn: () => getStudentAssessment(phaseId ?? '', courseParticipationID ?? ''),
  })
}
