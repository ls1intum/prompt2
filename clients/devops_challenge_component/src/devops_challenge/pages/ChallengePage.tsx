"use client"

import { useState, useEffect } from "react"
import { useChallengeStore } from "../zustand/useChallengeStore"
import { getStudentInfo } from "../network/queries/getStudentInfo"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { GitHubHandleInput } from "../components/GitHubHandleInput"
import { RepositoryInfo } from "../components/RepositoryInfo"
import { AssessmentPanel } from "../components/AssessmentPanel"

export default function StudentRepoForm() {
  const { phaseId } = useParams<{ phaseId: string }>()
  if (!phaseId) {
    throw new Error("Phase ID is required")
  }

  const { toast } = useToast()
  const { repoUrl, setRepoUrl, setAttempts, setMaxAttempts, setHasPassed, setFeedback } = useChallengeStore()

  const [loading, setLoading] = useState(true)
  const [githubUsername, setGithubUsername] = useState("")

  useEffect(() => {
    // Fetch student info when the component mounts
    const fetchStudentInfo = async () => {
      try {
        const studentInfo = await getStudentInfo(phaseId)
        setRepoUrl(studentInfo.repositoryUrl)
        setAttempts(studentInfo.attempts)
        setMaxAttempts(studentInfo.maxAttempts)
        setHasPassed(studentInfo.hasPassed)
        if (studentInfo.message) {
          setFeedback(studentInfo.message)
        }
      } catch (error) {
        // Only show error if it's not a "not found" error
        if (!(error instanceof Error && error.message.includes("not found"))) {
          toast({
            title: "Error loading data",
            description: error instanceof Error ? error.message : "Unknown error",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStudentInfo()
  }, [phaseId, setRepoUrl, setAttempts, setMaxAttempts, setHasPassed, setFeedback, toast])

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">DevOps Challenge</CardTitle>
          <CardDescription>Complete the tasks to demonstrate your DevOps skills</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !repoUrl ? (
            <GitHubHandleInput
              githubUsername={githubUsername}
              setGithubUsername={setGithubUsername}
              phaseId={phaseId}
            />
          ) : (
            <div className="space-y-6">
              <RepositoryInfo repoUrl={repoUrl} />
              <AssessmentPanel phaseId={phaseId} githubUsername={githubUsername} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

