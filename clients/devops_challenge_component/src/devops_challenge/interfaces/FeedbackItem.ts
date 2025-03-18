export interface FeedbackItem {
  type: "success" | "error" | "warning" | "info"
  message: string
}