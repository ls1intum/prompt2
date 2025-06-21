import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CreateOrUpdateAssessmentCompletionRequest } from '../../interfaces/assessment'

export const createOrUpdateAssessmentCompletion = async (
  coursePhaseID: string,
  assessmentCompletion: CreateOrUpdateAssessmentCompletionRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.post(
      `assessment/api/course_phase/${coursePhaseID}/student-assessment/completed`,
      assessmentCompletion,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}
