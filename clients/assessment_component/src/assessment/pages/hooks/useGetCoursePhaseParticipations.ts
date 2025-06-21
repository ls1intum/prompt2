import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { getCoursePhaseParticipations } from '../../network/queries/getCoursePhaseParticipations'
import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

export const useGetCoursePhaseParticipations = () => {
  const { phaseId } = useParams<{ phaseId: string }>()

  return useQuery<CoursePhaseParticipationWithStudent[]>({
    queryKey: ['participations', phaseId],
    queryFn: () => getCoursePhaseParticipations(phaseId ?? ''),
  })
}
