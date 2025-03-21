import { useState } from "react"
import { useParams } from "react-router-dom"
import { useDevOpsChallengeStore } from "../zustand/useDevOpsChallengeStore"
import { triggerAssessment } from "../network/queries/triggerAssessment"
import { getDeveloperProfile } from "../network/queries/getDeveloperProfile"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, CheckCircle2 } from "lucide-react"
import { set } from "react-hook-form"

export const AssessmentPanel = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const { toast } = useToast()

  const { developerProfile, setDeveloperProfile } = useDevOpsChallengeStore()
  const { githubHandle } = useDevOpsChallengeStore()
  const {feedback, setFeedback} = useDevOpsChallengeStore()

  // const [feedback, setFeedback] =  useState('')
  const [loading, setLoading] = useState(false)

  const handleTriggerAssessment = async () => {
    setLoading(true)
    try {
      const feedback = await triggerAssessment(githubHandle ?? 'mathildeshagl', phaseId ?? '', 'ge63sir')
      setFeedback(feedback)

      const updatedInfo = await getDeveloperProfile(phaseId ?? '')
      setDeveloperProfile(updatedInfo)

      toast({
        title: "Assessment completed",
        description: "Your code has been evaluated. Check the results below.",
        variant: "default",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred."
      setFeedback(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const attemptsRemaining = developerProfile && developerProfile.maxAttempts !== undefined && developerProfile.attempts !== undefined
    ? developerProfile.maxAttempts - developerProfile.attempts : undefined

  const attemptsUsedPercentage =
    developerProfile && developerProfile.maxAttempts !== undefined && developerProfile.attempts !== undefined
      ? (developerProfile.attempts / developerProfile.maxAttempts) * 100 : 0

  const isAssessmentDisabled = loading || (attemptsRemaining !== undefined && attemptsRemaining <= 0) || (developerProfile && developerProfile.hasPassed)

  return (
    <div className="space-y-6">
      {developerProfile && developerProfile.hasPassed ? (
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

          {developerProfile && developerProfile.maxAttempts !== undefined && developerProfile.attempts !== undefined && (
            <div className="space-y-2">
              <Progress value={attemptsUsedPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {developerProfile.attempts} of {developerProfile.maxAttempts} attempts used
              </div>
            </div>
          )}

          <Button onClick={handleTriggerAssessment} disabled={isAssessmentDisabled} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Evaluating your code...
              </>
            ) : developerProfile && developerProfile.hasPassed ? (
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

      {feedback && developerProfile && !developerProfile.hasPassed && (
        <Alert className="border-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
          <AlertTitle>Assessment Feedback</AlertTitle>
          <AlertDescription className="whitespace-pre-line">{feedback}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

