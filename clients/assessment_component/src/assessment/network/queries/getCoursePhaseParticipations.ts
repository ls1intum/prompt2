import { assessmentAxiosInstance } from '../assessmentServerConfig'

import { AssessmentParticipationWithStudent } from '../../interfaces/assessmentParticipationWithStudent'

export const getCoursePhaseParticipations = async (
  coursePhaseID: string,
): Promise<AssessmentParticipationWithStudent[]> => {
  const response = await assessmentAxiosInstance.get<AssessmentParticipationWithStudent[]>(
    `assessment/api/course_phase/${coursePhaseID}/config/participations`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
