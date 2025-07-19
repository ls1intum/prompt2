import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getMyGradeSuggestion } from '../../../network/queries/getMyGradeSuggestion'

export const useGetMyGradeSuggestion = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<number | undefined>({
    queryKey: ['myGradeSuggestion', phaseId],
    queryFn: () => getMyGradeSuggestion(phaseId ?? ''),
    enabled: !!phaseId,
  })
}
