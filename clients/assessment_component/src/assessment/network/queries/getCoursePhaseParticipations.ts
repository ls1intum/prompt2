import { assessmentAxiosInstance } from '../assessmentServerConfig'

import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'

export const getCoursePhaseParticipations = async (
  coursePhaseID: string,
): Promise<CoursePhaseParticipationWithStudent[]> => {
  const response = await assessmentAxiosInstance.get<CoursePhaseParticipationWithStudent[]>(
    `assessment/api/course_phase/${coursePhaseID}/config/participations`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
