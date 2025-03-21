import { useState } from 'react'
import { useDevOpsChallengeStore } from '../zustand/useDevOpsChallengeStore'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, CircleAlert, CheckCircle2 } from 'lucide-react'
import { useTriggerAssessment } from '../pages/hooks/useTriggerAssessment'
import { useGetDeveloperProfile } from '../pages/hooks/useGetDeveloperProfile'

export const AssessmentPanel = (): JSX.Element => {
  const { githubHandle } = useDevOpsChallengeStore()

  const [error, setError] = useState<string | null>(null)

  const assessmentMutation = useTriggerAssessment(setError)
  const developerQuery = useGetDeveloperProfile()

  const remainingAttempts =
    (developerQuery.data?.maxAttempts ?? 0) - (developerQuery.data?.attempts ?? 0)

  const handleTriggerAssessment = () => {
    assessmentMutation.mutate(githubHandle)
    developerQuery.refetch()
  }

  return (
    <div className='space-y-4'>
      {developerQuery.data?.repositoryURL && (
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold'>Repository Info</h3>
          <div className='text-sm text-gray-600'>
            <strong>Repository URL:</strong> {developerQuery.data.repositoryURL}
          </div>
        </div>
      )}
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold'>Assessment</h3>
        <div className='text-sm text-gray-600'>
          <strong>Remaining Attempts:</strong> {remainingAttempts}
        </div>
        <div className='text-sm text-gray-600'>
          <strong>Status:</strong>{' '}
          {developerQuery.data?.hasPassed ? (
            <span className='text-green-600'>Passed</span>
          ) : (
            <span className='text-red-600'>Not Passed</span>
          )}
        </div>
        <Button
          onClick={handleTriggerAssessment}
          disabled={
            assessmentMutation.isPending || remainingAttempts <= 0 || developerQuery.data?.hasPassed
          }
          className='w-full'
        >
          {assessmentMutation.isPending ? (
            <Loader2 className='ml-2 h-4 w-4 animate-spin' />
          ) : developerQuery.data?.hasPassed ? (
            <CheckCircle2 className='ml-2 h-4 w-4 text-green-600' />
          ) : (
            <CircleAlert className='ml-2 h-4 w-4 text-yellow-600' />
          )}
          Trigger Assessment
        </Button>
        {assessmentMutation.isError && error && (
          <Alert variant='destructive' className='mt-2'>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
