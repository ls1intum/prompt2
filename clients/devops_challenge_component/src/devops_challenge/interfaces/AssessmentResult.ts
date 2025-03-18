import { FeedbackItem } from "./FeedbackItem"

export interface AssessmentResult {
  status: "success" | "failed" | "pending" | null
  timestamp: string
  feedback: FeedbackItem[]
}