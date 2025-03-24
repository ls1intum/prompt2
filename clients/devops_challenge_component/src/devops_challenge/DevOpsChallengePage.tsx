import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GitHubHandleInput } from './components/GitHubHandleInput'
import { AssessmentPanel } from './components/AssessmentPanel'
import { useDevOpsChallengeStore } from './zustand/useDevOpsChallengeStore'

export const DevOpsChallengePage = (): JSX.Element => {
  const { developerProfile, setDeveloperProfile } = useDevOpsChallengeStore()

  return (
    <div className='max-w-xl mx-auto p-4'>
      <Card className='shadow-md'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>DevOps Challenge</CardTitle>
          <CardDescription>Complete the tasks to demonstrate your DevOps skills</CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {!developerProfile ? <GitHubHandleInput /> : <AssessmentPanel />}
        </CardContent>
      </Card>
    </div>
  )
}
