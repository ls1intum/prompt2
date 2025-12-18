import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { getSchemaHasAssessmentData } from '../../../network/queries/getPhaseHasAssessmentData'

export const useSchemaHasAssessmentData = (schemaID: string | undefined) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery({
    queryKey: ['schemaHasAssessmentData', schemaID, phaseId],
    queryFn: () => getSchemaHasAssessmentData(schemaID!, phaseId!),
    enabled: !!schemaID && !!phaseId,
    refetchOnWindowFocus: true,
  })
}
