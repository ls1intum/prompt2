import { useState } from 'react'
import { useChallengeStore } from '../zustand/useChallengeStore'
import { createRepository } from '../network/mutations/createRepository'
import { getStudentInfo } from '../network/queries/getStudentInfo'
import { triggerAssessment } from '../network/queries/triggerAssessment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from "@/hooks/use-toast"
import { useParams } from 'react-router-dom'

export default function StudentRepoForm() {
    const { phaseId } = useParams<{ phaseId: string }>()
    if (!phaseId) {
        throw new Error("Phase ID is required");
    }
    const { toast } = useToast()
    const {
        repoUrl, attempts, maxAttempts, feedback,
        setRepoUrl, setAttempts, setMaxAttempts, setFeedback
    } = useChallengeStore()

    const [githubUsername, setGithubUsername] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCreateRepo = async () => {
        if (!githubUsername) {
            toast({ title: 'Error', description: 'Please enter your GitHub username', variant: 'destructive' })
            return
        }
        setLoading(true)
        try {
            const url = await createRepository(githubUsername, phaseId as string)
            setRepoUrl(url)
            toast({ title: 'Success', description: 'Repository has been created!' })
        } catch (error) {
            const errorMessage = (error as Error).message || 'Unknown error';
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const handleTriggerAssessment = async () => {
        setLoading(true)
        try {
            const result = await triggerAssessment(phaseId, githubUsername)
            setAttempts(result.attempts)
            setMaxAttempts(result.maxAttempts)
            setFeedback(result.message)
            toast({ title: 'Assessment started', description: 'Results will be displayed' })
        } catch (error) {
            toast({ title: 'Error', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-lg mx-auto space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>DevOps Challenge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!repoUrl ? (
                        <div className="flex space-x-2">
                            <Input
                                placeholder="GitHub username"
                                value={githubUsername}
                                onChange={(e) => setGithubUsername(e.target.value)}
                            />
                            <Button onClick={handleCreateRepo} disabled={loading}>Create Repo</Button>
                        </div>
                    ) : (
                        <>
                            <p>Repository: <a href={repoUrl} className="text-blue-500 underline" target="_blank">{repoUrl}</a></p>
                            <Button onClick={handleTriggerAssessment} disabled={loading || (attempts !== undefined && attempts >= (maxAttempts ?? 0))}>
                                Start Assessment
                            </Button>
                            {attempts !== undefined && maxAttempts !== undefined && (
                                <p>Remaining attempts: {maxAttempts - attempts}</p>
                            )}
                            {feedback && <p className="text-gray-700">{feedback}</p>}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
