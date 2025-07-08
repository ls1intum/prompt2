import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getCoursePhaseConfig } from '../../network/queries/getCoursePhaseConfig'
import { CoursePhaseConfig } from '../../interfaces/coursePhaseConfig'

export const useGetCoursePhaseConfig = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<CoursePhaseConfig>({
    queryKey: ['coursePhaseConfig', phaseId],
    queryFn: () => getCoursePhaseConfig(phaseId ?? ''),
  })
}
