import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useTriggerAssessment } from '../pages/hooks/useTriggerAssessment'
import { useGetDeveloperProfile } from '../pages/hooks/useGetDeveloperProfile'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, ExternalLink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

export const AssessmentPanel = (): JSX.Element => {
  const [error, setError] = useState<string | null>(null)
  const [confirmedOwnWork, setConfirmedOwnWork] = useState(false)

  const assessmentMutation = useTriggerAssessment(setError)
  const developerQuery = useGetDeveloperProfile()

  const remainingAttempts = Math.max(
    (developerQuery.data?.maxAttempts ?? 0) - (developerQuery.data?.attempts ?? 0),
    0,
  )

  const handleTriggerAssessment = () => {
    assessmentMutation.mutate()
    developerQuery.refetch()
  }

  return (
    <Card>
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-xl flex items-center'>
            <Github className='mr-2 h-5 w-5' />
            Repository Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex flex-col space-y-1'>
              <span className='text-sm text-muted-foreground'>Repository URL</span>
              <a
                href={developerQuery.data?.repositoryUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary flex items-center hover:underline'
              >
                {developerQuery.data?.repositoryUrl}
                <ExternalLink className='ml-1 h-3 w-3' />
              </a>
            </div>

            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-2'>
                <Badge
                  variant='secondary'
                  className={'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}
                >
                  {developerQuery.data?.hasPassed ? 'Passed' : 'Not Passed'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex flex-col space-y-6'>
            <div className='flex justify-between items-center'>
              <h1 className='text-3xl font-bold'>GitHub Challenge</h1>
              <div className='flex items-center space-x-2'>
                <Badge variant='outline' className='text-sm'>
                  Remaining Attempts: {remainingAttempts}
                </Badge>
              </div>
            </div>

            <div className='grid gap-6 mt-4'>
              <div className='flex flex-col space-y-4'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-xl font-semibold'>Assessment</h2>
                  <div className='flex items-start space-x-2 my-4'></div>
                  <Button
                    onClick={handleTriggerAssessment}
                    disabled={
                      assessmentMutation.isPending ||
                      remainingAttempts <= 0 ||
                      developerQuery.data?.hasPassed ||
                      !confirmedOwnWork
                    }
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

                {developerQuery.data && (
                  <div className='mt-4'>
                    <div className='flex items-center mb-2'>
                      <h3 className='text-lg font-medium'>Last Assessment Result</h3>
                      <span className='ml-2'>
                        {developerQuery.data?.hasPassed ? (
                          <CheckCircle className='h-5 w-5 text-green-500' />
                        ) : (
                          <AlertCircle className='h-5 w-5 text-red-500' />
                        )}
                      </span>
                    </div>

                    {assessmentMutation.isError && error && (
                      <Alert>
                        <div className='flex items-center'>
                          <AlertCircle className='h-4 w-4' />
                          <AlertTitle className='ml-2'>Error</AlertTitle>
                        </div>
                        <AlertDescription className='mt-1'>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Checkbox
                      id='confirm-own-work'
                      checked={confirmedOwnWork}
                      onCheckedChange={(checked) => setConfirmedOwnWork(checked as boolean)}
                    />
                    <label
                      htmlFor='confirm-own-work'
                      className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
                    >
                      I confirm that I have completed this challenge independently and without
                      unauthorized assistance.
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Card>
  )
}
