import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getPassedStudentsCount } from '../../network/queries/getPassedStudentsCount'

export const useGetPassedStudentsCount = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<number>({
    queryKey: ['devOpsPassedStudentsCount', phaseId],
    queryFn: () => getPassedStudentsCount(phaseId ?? ''),
  })
}
