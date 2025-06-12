import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getCurrentAssessmentTemplate } from '../../../../../network/queries/getCurrentAssessmentTemplate'
import { AssessmentTemplate } from '../../../../../interfaces/assessmentTemplate'

export const useGetCurrentAssessmentTemplate = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<AssessmentTemplate>({
    queryKey: ['currentAssessmentTemplate', phaseId],
    queryFn: () => getCurrentAssessmentTemplate(phaseId ?? ''),
  })
}
