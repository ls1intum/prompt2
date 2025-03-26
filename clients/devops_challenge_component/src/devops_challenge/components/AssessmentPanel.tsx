import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useTriggerAssessment } from '../pages/hooks/useTriggerAssessment'
import { useGetDeveloperProfile } from '../pages/hooks/useGetDeveloperProfile'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, ExternalLink, RefreshCw, CheckCircle, AlertCircle, Hourglass, Trophy } from 'lucide-react'
import { RepositoryInformation } from './RepositoryInformation'

export const AssessmentPanel = (): JSX.Element => {
  const [error, setError] = useState<string | null>(null)
  const [confirmedOwnWork, setConfirmedOwnWork] = useState(false)

  const assessmentMutation = useTriggerAssessment(setError)
  const developerQuery = useGetDeveloperProfile()

  const remainingAttempts = Math.max(
    (developerQuery.data?.maxAttempts ?? 0) - (developerQuery.data?.attempts ?? 0),
    0,
  )

  const maxAttempts = developerQuery.data?.maxAttempts ?? 0

  const handleTriggerAssessment = () => {
    assessmentMutation.mutate()
    developerQuery.refetch()
  }

  return (
    <div className='grid gap-6 mt-4'>
      <RepositoryInformation />

      <Card className='p-6'>
        <div className='flex flex-col space-y-4'>
          <div className='flex justify-between items-center'>
            <Trophy className='mr-1 h-5 w-5' />
            <h2 className='text-xl font-semibold'>Assessment</h2>
            <Button
              onClick={handleTriggerAssessment}
              disabled={assessmentMutation.isPending || remainingAttempts === 0}
              className='flex items-center space-x-2'
            >
              {assessmentMutation.isPending ? (
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Github className='mr-2 h-4 w-4' />
              )}
              <span>{assessmentMutation.isPending ? 'Assessing...' : 'Run Assessment'}</span>
            </Button>
          </div>

          <div className='mt-4'>
            <div className='flex items-center mb-2'>
              <h3 className='text-lg font-medium'>Last Assessment Result</h3>
              {remainingAttempts !== maxAttempts && (
                <span className='ml-2'>
                  {developerQuery.data?.hasPassed ? (
                    <CheckCircle className='h-5 w-5 text-green-500' />
                  ) : (
                    <AlertCircle className='h-5 w-5 text-red-500' />
                  )}
                </span>
              )}
              {remainingAttempts === maxAttempts && (
                <span className='ml-2'>
                  <Hourglass className='h-5 w-5 text-gray-500' />
                </span>
              )}
            </div>

            <div className='space-y-3 mt-2'>
              {remainingAttempts !== maxAttempts && (
                <Alert
                  variant={
                    !developerQuery.data?.hasPassed && assessmentMutation.isError
                      ? 'destructive'
                      : 'default'
                  }
                >
                  <div className='flex items-center'>
                    {developerQuery.data?.hasPassed ? (
                      <CheckCircle className='h-4 w-4' />
                    ) : (
                      <AlertCircle className='h-4 w-4' />
                    )}
                    <AlertTitle className='ml-2'>
                      {!developerQuery.data?.hasPassed && assessmentMutation.isError
                        ? 'Error'
                        : 'Success'}
                    </AlertTitle>
                  </div>
                  <AlertDescription className='mt-1'>
                    {!developerQuery.data?.hasPassed && assessmentMutation.isError
                      ? error
                      : 'You passed the challenge!'}
                  </AlertDescription>
                </Alert>
              )}
              {remainingAttempts === maxAttempts && (
                <Alert variant='default'>
                  <Hourglass className='h-4 w-4' />
                  <AlertTitle>Assessment Pending</AlertTitle>
                  <AlertDescription>
                    You have not yet attempted the challenge.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
