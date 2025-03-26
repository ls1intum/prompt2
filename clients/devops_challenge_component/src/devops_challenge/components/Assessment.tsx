import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useTriggerAssessment } from '../pages/hooks/useTriggerAssessment'
import { useGetDeveloperProfile } from '../pages/hooks/useGetDeveloperProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Hourglass,
  Trophy,
  Clock,
  PartyPopper,
} from 'lucide-react'

export const Assessment = (): JSX.Element => {
  const [error, setError] = useState<string | null>(null)

  const assessmentMutation = useTriggerAssessment(setError)
  const developerQuery = useGetDeveloperProfile()

  const remainingAttempts = Math.max(
    (developerQuery.data?.maxAttempts ?? 0) - (developerQuery.data?.attempts ?? 0),
    0,
  )

  const maxAttempts = developerQuery.data?.maxAttempts ?? 0

  const passingPosition = developerQuery.data?.position ?? undefined

  const passed = developerQuery.data?.hasPassed

  const handleTriggerAssessment = () => {
    assessmentMutation.mutate()
    developerQuery.refetch()
  }

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-xl flex items-center'>
          <Trophy className='mr-2 h-5 w-5' />
          Assessment
          <div className='flex items-center space-x-2 ml-auto'>
            <Button
              onClick={handleTriggerAssessment}
              disabled={assessmentMutation.isPending || remainingAttempts === 0}
              className='flex items-center space-x-2'
            >
              {assessmentMutation.isPending ? (
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Trophy className='mr-2 h-4 w-4' />
              )}
              <span>{assessmentMutation.isPending ? 'Assessing...' : 'Run Assessment'}</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-start space-x-2 mt-4'>
          {passed && passingPosition !== undefined && passingPosition <= 150 && (
            <Alert variant='default'>
              <PartyPopper className='h-4 w-4' />
              <AlertTitle>Congratulations</AlertTitle>
              <AlertDescription>You are admitted to the DevOps course!</AlertDescription>
            </Alert>
          )}
          {passed && passingPosition !== undefined &&passingPosition > 150 && (
            <Alert variant='default'>
              <Clock className='h-4 w-4' />
              <AlertTitle>Waitlisted</AlertTitle>
              <AlertDescription>You are on the waitlist for the DevOps course!</AlertDescription>
            </Alert>
          )}
        </div>
        <div className='mt-4'>
          <div className='flex items-center mb-2'>
            <h3 className='text-lg font-medium'>Last Assessment Result</h3>
            {remainingAttempts !== maxAttempts && (
              <span className='ml-2'>
                {passed ? (
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
              <Alert variant={!passed ? 'destructive' : 'default'}>
                <div className='flex items-center'>
                  {passed ? (
                    <CheckCircle className='h-4 w-4' />
                  ) : (
                    <AlertCircle className='h-4 w-4' />
                  )}
                  <AlertTitle className='ml-2'>
                    {!passed ? 'Error' : 'Success'}
                  </AlertTitle>
                </div>
                <AlertDescription className='mt-1'>
                  {!passed
                    ? (error ?? 'You failed the challenge.')
                    : 'You passed the challenge!'}
                </AlertDescription>
              </Alert>
            )}
            {remainingAttempts === maxAttempts && (
              <Alert variant='default'>
                <Hourglass className='h-4 w-4' />
                <AlertTitle>Assessment Pending</AlertTitle>
                <AlertDescription>You have not yet attempted the challenge.</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
