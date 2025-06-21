import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { getAllTeams } from '../../network/queries/getAllTeams'
import { Team } from '../../interfaces/team'

export const useGetAllTeams = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<Team[]>({
    queryKey: ['teams', phaseId],
    queryFn: () => getAllTeams(phaseId ?? ''),
  })
}
