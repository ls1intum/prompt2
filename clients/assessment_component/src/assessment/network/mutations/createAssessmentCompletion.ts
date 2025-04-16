import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { AssessmentCompletion } from '../../interfaces/assessment'

export const createAssessmentCompletion = async (
  coursePhaseID: string,
  assessmentCompletion: AssessmentCompletion,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.post<AssessmentCompletion>(
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
