import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CreateFeedbackItemRequest } from '../../interfaces/feedbackItem'

export const createFeedbackItem = async (
  coursePhaseID: string,
  feedbackItem: CreateFeedbackItemRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.post(
      `assessment/api/course_phase/${coursePhaseID}/evaluation/feedback-items`,
      {
        ...feedbackItem,
        coursePhaseID,
      },
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
