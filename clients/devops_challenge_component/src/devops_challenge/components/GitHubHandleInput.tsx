"use client"

import { useState } from "react"
import { createRepository } from "../network/mutations/createRepository"
import { useChallengeStore } from "../zustand/useChallengeStore"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Github, Loader2, AlertCircle } from "lucide-react"

interface GitHubHandleInputProps {
  githubUsername: string
  setGithubUsername: (username: string) => void
  phaseId: string
}

export function GitHubHandleInput({ githubUsername, setGithubUsername, phaseId }: GitHubHandleInputProps) {
  const { toast } = useToast()
  const { setRepoUrl } = useChallengeStore()
  const [loading, setLoading] = useState(false)

  const handleCreateRepo = async () => {
    if (!githubUsername) {
      toast({
        title: "GitHub username required",
        description: "Please enter your GitHub username to continue",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const url = await createRepository(githubUsername, phaseId)
      setRepoUrl(url)
      toast({
        title: "Repository created",
        description: "Your challenge repository has been successfully created!",
        variant: "default",
      })
    } catch (error) {
      const errorMessage = (error as Error).message || "Unknown error occurred"
      toast({
        title: "Repository creation failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Getting Started</AlertTitle>
        <AlertDescription>Enter your GitHub username to create a repository for this challenge.</AlertDescription>
      </Alert>

      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            placeholder="GitHub username"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            className="pl-9"
            disabled={loading}
          />
        </div>
        <Button onClick={handleCreateRepo} disabled={loading || !githubUsername} className="min-w-[120px]">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating
            </>
          ) : (
            "Create Repo"
          )}
        </Button>
      </div>
    </div>
  )
}

