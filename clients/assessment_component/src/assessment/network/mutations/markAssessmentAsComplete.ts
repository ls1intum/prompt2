import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CreateOrUpdateAssessmentCompletionRequest } from '../../interfaces/assessmentCompletion'

export const markAssessmentAsComplete = async (
  coursePhaseID: string,
  assessmentCompletion: CreateOrUpdateAssessmentCompletionRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.post(
      `assessment/api/course_phase/${coursePhaseID}/student-assessment/completed/mark-complete`,
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
