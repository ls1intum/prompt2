import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { CoursePhaseWithMetaData } from '@tumaet/prompt-shared-state'
import { getCoursePhase } from '@/network/queries/getCoursePhase'

export const useGetCoursePhase = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<CoursePhaseWithMetaData>({
    queryKey: ['course_phase', phaseId],
    queryFn: () => getCoursePhase(phaseId ?? ''),
  })
}
