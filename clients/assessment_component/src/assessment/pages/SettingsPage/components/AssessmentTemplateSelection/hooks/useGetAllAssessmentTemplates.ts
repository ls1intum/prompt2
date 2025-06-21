import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getAllAssessmentTemplates } from '../../../../../network/queries/getAllAssessmentTemplates'
import { AssessmentTemplate } from '../../../../../interfaces/assessmentTemplate'

export const useGetAllAssessmentTemplates = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<AssessmentTemplate[]>({
    queryKey: ['assessmentTemplates', phaseId],
    queryFn: () => getAllAssessmentTemplates(phaseId ?? ''),
  })
}
