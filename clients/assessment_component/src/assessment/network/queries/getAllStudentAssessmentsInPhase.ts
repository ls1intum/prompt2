import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { Assessment } from '../../interfaces/assessment'

export const getAllStudentAssessmentsInPhase = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<Assessment[]> => {
  const response = await assessmentAxiosInstance.get<Assessment[]>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/course-participation/${courseParticipationID}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
