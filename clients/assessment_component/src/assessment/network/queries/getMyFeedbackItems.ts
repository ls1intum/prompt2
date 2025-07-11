import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { FeedbackItem } from '../../interfaces/feedbackItem'

export const getMyFeedbackItems = async (coursePhaseID: string): Promise<FeedbackItem[]> => {
  const response = await assessmentAxiosInstance.get<FeedbackItem[]>(
    `assessment/api/course_phase/${coursePhaseID}/evaluation/feedback-items/my-feedback`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}
