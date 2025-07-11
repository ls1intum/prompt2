import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { CreateOrUpdateFeedbackItemRequest } from '../../interfaces/feedbackItem'

export const createOrUpdateFeedbackItem = async (
  coursePhaseID: string,
  feedbackItem: CreateOrUpdateFeedbackItemRequest,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.post(
      `assessment/api/course_phase/${coursePhaseID}/evaluation/feedback-items`,
      feedbackItem,
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
