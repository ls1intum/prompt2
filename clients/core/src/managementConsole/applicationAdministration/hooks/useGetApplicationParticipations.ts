import { ApplicationParticipation } from '../interfaces/applicationParticipation'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getApplicationParticipations } from '@core/network/queries/applicationParticipations'

export const useGetApplicationParticipations = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<ApplicationParticipation[]>({
    queryKey: ['application_participations', 'students', phaseId],
    queryFn: () => getApplicationParticipations(phaseId ?? ''),
  })
}
