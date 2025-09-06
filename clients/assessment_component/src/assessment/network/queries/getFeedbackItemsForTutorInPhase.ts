import { assessmentAxiosInstance } from '../assessmentServerConfig'
import { FeedbackItem } from '../../interfaces/feedbackItem'

export const getFeedbackItemsForTutorInPhase = async (
  coursePhaseID: string,
  tutorParticipationID: string,
): Promise<FeedbackItem[]> => {
  const response = await assessmentAxiosInstance.get<FeedbackItem[]>(
    `assessment/api/course_phase/${coursePhaseID}/evaluation/feedback-items/tutor/${tutorParticipationID}`,
  )
  return response.data
}
