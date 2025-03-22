import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getDeveloperProfile } from '../../network/queries/getDeveloperProfile'

export const useGetDeveloperProfile = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery({
    queryKey: ['developerProfile', phaseId],
    queryFn: () => getDeveloperProfile(phaseId ?? ''),
    enabled: !!phaseId,
  })
}
