import { assessmentAxiosInstance } from '../assessmentServerConfig'

export const deleteFeedbackItem = async (
  coursePhaseID: string,
  feedbackItemID: string,
): Promise<void> => {
  try {
    await assessmentAxiosInstance.delete(
      `assessment/api/course_phase/${coursePhaseID}/evaluation/feedback-items/${feedbackItemID}`,
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
