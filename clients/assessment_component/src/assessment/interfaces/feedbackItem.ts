export type FeedbackType = 'positive' | 'negative'

export interface FeedbackItem {
  id: string
  feedbackType: FeedbackType
  feedbackText: string
  courseParticipationID: string
  coursePhaseID: string
  authorCourseParticipationID: string
  createdAt: string
}

export interface CreateOrUpdateFeedbackItemRequest {
  id?: string // Optional for create, required for update
  feedbackType: FeedbackType
  feedbackText: string
  courseParticipationID: string
  coursePhaseID: string
  authorCourseParticipationID: string
}

export interface CreateFeedbackItemRequest {
  feedbackType: FeedbackType
  feedbackText: string
  courseParticipationID: string
  authorCourseParticipationID: string
}

export interface UpdateFeedbackItemRequest {
  id: string
  feedbackType?: FeedbackType
  feedbackText?: string
  courseParticipationID?: string
  authorCourseParticipationID?: string
}
