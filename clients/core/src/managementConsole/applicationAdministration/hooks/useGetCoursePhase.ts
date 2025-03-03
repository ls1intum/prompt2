import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getCoursePhaseByID } from '@core/network/queries/coursePhase'
import { CoursePhaseWithMetaData } from '@tumaet/prompt-shared-state'

export const useGetCoursePhase = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<CoursePhaseWithMetaData>({
    queryKey: ['course_phase', phaseId],
    queryFn: () => getCoursePhaseByID(phaseId ?? ''),
  })
}
