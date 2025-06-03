import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getAllScoreLevels } from '../../network/queries/getAllScoreLevels'
import { ScoreLevelWithParticipation } from '../../interfaces/scoreLevelWithParticipation'

export const useGetAllScoreLevels = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<ScoreLevelWithParticipation[]>({
    queryKey: ['scoreLevels', phaseId],
    queryFn: () => getAllScoreLevels(phaseId ?? ''),
  })
}
