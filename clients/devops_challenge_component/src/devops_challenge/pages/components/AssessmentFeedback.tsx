import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { FeedbackItem } from "../../interfaces/FeedbackItem"

interface AssessmentFeedbackProps {
  feedback: FeedbackItem[]
}

export function AssessmentFeedback({ feedback }: AssessmentFeedbackProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-800 dark:text-green-300" /> // Green icon for success
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-800 dark:text-red-300" /> // Red icon for error
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-800 dark:text-yellow-300" /> // Yellow icon for warning
      default:
        return <Info className="h-4 w-4 text-gray-800 dark:text-gray-300" /> // Default icon for info
    }
  }

  const getAlertVariant = (type: string): "default" | "destructive" => {
    return type === "error" ? "destructive" : "default"
  }

  const getAlertTitle = (type: string) => {
    switch (type) {
      case "success":
        return "Success"
      case "error":
        return "Error"
      case "warning":
        return "Warning"
      default:
        return "Info"
    }
  }

  const getAlertTextColor = (type: string) => {
    if (type === "success") {
      return "text-green-800 dark:text-green-300" // Green text for success
    }
    if (type === "error") {
      return "text-red-800 dark:text-red-300" // Red text for error
    }
    return "text-gray-800 dark:text-gray-300" // Default text color for other types
  }

  return (
    <div className="space-y-4 mt-2">
      {feedback.map((item, index) => (
        <Alert key={index} variant={getAlertVariant(item.type)}>
          <div className="flex items-center">
            {getAlertIcon(item.type)}
            <AlertTitle className={`ml-2 ${getAlertTextColor(item.type)}`}>{getAlertTitle(item.type)}</AlertTitle>
          </div>
          <AlertDescription className={`mt-1 ${getAlertTextColor(item.type)}`}>{item.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

export default AssessmentFeedback