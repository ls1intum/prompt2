import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getDeadline } from '../../network/queries/getDeadline'

export const useGetDeadline = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<Date>({
    queryKey: ['deadline', phaseId],
    queryFn: () => getDeadline(phaseId ?? ''),
  })
}
