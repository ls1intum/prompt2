import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import type { SurveyTimeframe } from '../../../interfaces/timeframe'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CalendarIcon, AlertCircle, Loader2 } from 'lucide-react'
import { updateSurveyTimeframe as updateSurveyTimeframeFn } from '../../../network/mutations/updateSurveyTimeframe'

interface SurveyTimeframeSettingsProps {
  surveyTimeframe: SurveyTimeframe
}

export const SurveyTimeframeSettings = ({
  surveyTimeframe,
}: SurveyTimeframeSettingsProps): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()
  const queryClient = useQueryClient()

  // Convert dates to a YYYY-MM-DD format for the date input
  const formatDate = (date: Date) => new Date(date).toISOString().slice(0, 10)

  const [startDate, setStartDate] = useState<string>(
    surveyTimeframe.timeframeSet ? formatDate(surveyTimeframe.surveyStart) : '',
  )
  const [endDate, setEndDate] = useState<string>(
    surveyTimeframe.timeframeSet ? formatDate(surveyTimeframe.surveyDeadline) : '',
  )
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: ({ start, end }: { start: Date; end: Date }) =>
      updateSurveyTimeframeFn(phaseId ?? '', start, end),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_allocation_survey_timeframe', phaseId] })
      setError(null)
    },
    onError: () => {
      setError('Failed to update survey timeframe. Please try again.')
    },
  })

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    // Create Date objects from the input strings
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start > end) {
      setError('Start date cannot be after end date.')
      return
    }
    setError(null)
    mutation.mutate({ start: start, end: end })
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='text-xl flex items-center gap-2'>
          <CalendarIcon className='h-5 w-5 text-primary' />
          Survey Timeframe
        </CardTitle>
        <CardDescription>Set the start and end dates for the survey.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          <form id='timeframe-form' onSubmit={handleUpdate} className='space-y-6'>
            <div className='grid sm:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label htmlFor='start-date' className='font-medium'>
                  Start Date
                </Label>
                <div className='relative'>
                  <Input
                    id='start-date'
                    type='date'
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className='w-full'
                    required
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='end-date' className='font-medium'>
                  End Date
                </Label>
                <div className='relative'>
                  <Input
                    id='end-date'
                    type='date'
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className='w-full'
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant='destructive' className='mt-4'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>

          <div className='flex justify-end'>
            <Button
              type='submit'
              form='timeframe-form'
              disabled={
                mutation.isPending ||
                !startDate ||
                !endDate ||
                (startDate === formatDate(surveyTimeframe.surveyStart) &&
                  endDate === formatDate(surveyTimeframe.surveyDeadline))
              }
              className='min-w-[180px]'
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Updating...
                </>
              ) : (
                'Update Timeframe'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
