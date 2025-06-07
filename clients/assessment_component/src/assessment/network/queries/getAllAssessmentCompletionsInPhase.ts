import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { AssessmentCompletion } from '../../interfaces/assessment'

export const getAllAssessmentCompletionsInPhase = async (
  coursePhaseID: string,
): Promise<AssessmentCompletion[]> => {
  const response = await assessmentAxiosInstance.get<AssessmentCompletion[]>(
    `assessment/api/course_phase/${coursePhaseID}/student-assessment/completed`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
