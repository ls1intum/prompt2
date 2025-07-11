import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { AssessmentCompletion } from '../../interfaces/assessmentCompletion'

export const getAssessmentCompletion = async (
  coursePhaseID: string,
  courseParticipationID: string,
): Promise<AssessmentCompletion> => {
  const response = await assessmentAxiosInstance.get<AssessmentCompletion>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/completed/course-participation/${courseParticipationID}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
