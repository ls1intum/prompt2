import { useQuery } from '@tanstack/react-query'
import { getNoteTags } from '../queries/getNoteTags'

export const useNoteTags = () => {
  return useQuery({
    queryKey: ['noteTags'],
    queryFn: getNoteTags,
  })
}
