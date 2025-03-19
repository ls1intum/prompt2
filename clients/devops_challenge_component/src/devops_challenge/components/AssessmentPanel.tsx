import { useState } from "react"
import { useChallengeStore } from "../zustand/useChallengeStore"
import { triggerAssessment } from "../network/queries/triggerAssessment"
import { getStudentInfo } from "../network/queries/getStudentInfo"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, CheckCircle2 } from "lucide-react"

interface AssessmentPanelProps {
  phaseId: string
  githubUsername: string
}

export function AssessmentPanel({ phaseId, githubUsername }: AssessmentPanelProps) {
  const { toast } = useToast()
  const { attempts, maxAttempts, feedback, hasPassed, setAttempts, setMaxAttempts, setFeedback, setHasPassed } =
    useChallengeStore()

  const [loading, setLoading] = useState(false)

  const handleTriggerAssessment = async () => {
    setLoading(true)
    try {
      // First trigger the assessment
      const result = await triggerAssessment(phaseId, githubUsername)
      setAttempts(result.attempts)
      setMaxAttempts(result.maxAttempts)
      setFeedback(result.message)

      // Then get updated student info to check if they passed
      const updatedInfo = await getStudentInfo(phaseId)
      setHasPassed(updatedInfo.hasPassed)
      if (updatedInfo.message) {
        setFeedback(updatedInfo.message)
      }
      setAttempts(updatedInfo.attempts)

      toast({
        title: "Assessment completed",
        description: "Your code has been evaluated. Check the results below.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Assessment failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const attemptsRemaining = maxAttempts !== undefined && attempts !== undefined ? maxAttempts - attempts : undefined

  const attemptsUsedPercentage =
    maxAttempts !== undefined && attempts !== undefined ? (attempts / maxAttempts) * 100 : 0

  const isAssessmentDisabled = loading || (attemptsRemaining !== undefined && attemptsRemaining <= 0) || hasPassed

  return (
    <div className="space-y-6">
      {hasPassed ? (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Challenge Completed</AlertTitle>
          <AlertDescription>Congratulations! You have successfully passed this assessment.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Assessment Status</div>
            {attemptsRemaining !== undefined && (
              <Badge
                variant="outline"
                className={attemptsRemaining > 0 ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}
              >
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining
              </Badge>
            )}
          </div>

          {maxAttempts !== undefined && attempts !== undefined && (
            <div className="space-y-2">
              <Progress value={attemptsUsedPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {attempts} of {maxAttempts} attempts used
              </div>
            </div>
          )}

          <Button onClick={handleTriggerAssessment} disabled={isAssessmentDisabled} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Evaluating your code...
              </>
            ) : hasPassed ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Assessment Passed
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start Assessment
              </>
            )}
          </Button>
        </div>
      )}

      {feedback && !hasPassed && (
        <Alert className="border-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
          <AlertTitle>Assessment Feedback</AlertTitle>
          <AlertDescription className="whitespace-pre-line">{feedback}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

