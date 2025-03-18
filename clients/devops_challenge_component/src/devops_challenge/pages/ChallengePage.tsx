import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Github, GitPullRequest, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RepositoryInfo } from "../components/RepositoryInfo"
import { AssessmentFeedback } from "../components/AssessmentFeedback"
import { RepositoryData } from "../interfaces/RepositoryData"

const dummyRepositoryData: RepositoryData = {
  repositoryUrl: "https://example.com",
  remainingAttempts: 3,
  lastAssessment: null,
}

export default function ChallengePage() {
  const { toast } = useToast()
  const [repositoryData, setRepositoryData] = useState(dummyRepositoryData)
  const [isAssessing, setIsAssessing] = useState(false)

  // Simulate triggering an assessment
  const triggerAssessment = async () => {
    if (repositoryData.remainingAttempts <= 0) {
      toast({
        title: "No attempts remaining",
        description: "You have used all your assessment attempts.",
        variant: "destructive",
      })
      return
    }

    setIsAssessing(true)

    // Simulate API call to challenge server
    setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      const success = Math.random() > 0.5

      setRepositoryData({
        ...repositoryData,
        remainingAttempts: repositoryData.remainingAttempts - 1,
        lastAssessment: {
          status: success ? "success" : "failed",
          timestamp: new Date().toISOString(),
          feedback: success
            ? [{ type: "success", message: "All tests passed successfully!" }]
            : [
              { type: "error", message: "Missing required file: README.md" },
              { type: "error", message: "Test suite failed: 3/10 tests passing" },
            ],
        },
      })

      toast({
        title: success ? "Assessment Successful" : "Assessment Failed",
        description: success
          ? "Your repository passed all checks!"
          : "Your repository failed some checks. See feedback for details.",
        variant: success ? "default" : "destructive",
      })

      setIsAssessing(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">DevOps Technical Challenge</h1>
        </div>

        <div className="grid gap-6 mt-4">
          <RepositoryInfo repositoryData={repositoryData} />

          <Card className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Assessment</h2>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-sm bg-gray-100 text-gray-800">
                    Remaining Attempts: {repositoryData.remainingAttempts}
                  </Badge>
                  <Button
                    onClick={triggerAssessment}
                    disabled={isAssessing || repositoryData.remainingAttempts <= 0}
                    className="flex items-center"
                  >
                    {isAssessing ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <GitPullRequest className="mr-2 h-4 w-4" />
                    )}
                    <span>{isAssessing ? "Assessing..." : "Trigger Assessment"}</span>
                  </Button>
                </div>
              </div>

              {repositoryData.lastAssessment && (
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-medium">Last Assessment Result</h3>
                    <span className="ml-2">
                      {repositoryData.lastAssessment.status === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </span>
                  </div>

                  <AssessmentFeedback feedback={repositoryData.lastAssessment.feedback} />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}