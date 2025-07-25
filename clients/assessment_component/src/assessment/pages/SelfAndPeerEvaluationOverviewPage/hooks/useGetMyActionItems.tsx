import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getMyActionItems } from '../../../network/queries/getMyActionItems'
import { ActionItem } from '../../../interfaces/actionItem'

export const useGetMyActionItems = (options?: { enabled?: boolean }) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<ActionItem[]>({
    queryKey: ['myActionItems', phaseId],
    queryFn: () => getMyActionItems(phaseId ?? ''),
    enabled: options?.enabled ?? true,
  })
}
