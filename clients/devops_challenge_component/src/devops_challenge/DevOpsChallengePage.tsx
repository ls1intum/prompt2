import { useState, useEffect } from "react"
import { useDevOpsChallengeStore } from "./zustand/useDevOpsChallengeStore"
import { useCourseStore } from '@tumaet/prompt-shared-state'
import { getDeveloperProfile } from "./network/queries/getDeveloperProfile"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { LoadingPage } from "@/components/LoadingPage"
import { GitHubHandleInput } from "./components/GitHubHandleInput"
import { RepositoryInfo } from "./components/RepositoryInfo"
import { AssessmentPanel } from "./components/AssessmentPanel"

import { CoursePhaseParticipationWithStudent } from '@tumaet/prompt-shared-state'
import { getOwnCoursePhaseParticipation } from '@/network/queries/getOwnCoursePhaseParticipation'
import { DeveloperProfile } from "./interfaces/DeveloperProfile"
import { useQuery } from '@tanstack/react-query'

export const DevOpsChallengePage = (): JSX.Element => {
  const { developerProfile } = useDevOpsChallengeStore()

  const renderChallengeContent = () => {
    if (!developerProfile) {
      return <div>Loading...</div>
    }
    else if (!developerProfile.repositoryURL) {
      return <GitHubHandleInput />
    }
    else if (!developerProfile.hasPassed) {
      return <AssessmentPanel />
    }
    else {
      return <div>Challenge completed</div>
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">DevOps Challenge</CardTitle>
          <CardDescription>Complete the tasks to demonstrate your DevOps skills</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>{renderChallengeContent()}</div>
        </CardContent>
      </Card>
    </div>
  )
}

