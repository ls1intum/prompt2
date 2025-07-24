import { Loader2 } from 'lucide-react'

import { ErrorPage } from '@tumaet/prompt-ui-components'

import { FeedbackItemDisplayPanel } from './components/FeedbackItemDisplayPanel'
import { useGetFeedbackItemsForStudent } from './hooks/useGetFeedbackItemsForStudent'

interface FeedbackItemsPanelProps {
  courseParticipationID: string
}

export const FeedbackItemsPanel = ({ courseParticipationID }: FeedbackItemsPanelProps) => {
  const { positiveFeedbackItems, negativeFeedbackItems, isLoading, isError, refetch } =
    useGetFeedbackItemsForStudent(courseParticipationID)

  if (isError) {
    return <ErrorPage message='Error loading feedback items' onRetry={refetch} />
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  if (positiveFeedbackItems.length === 0 && negativeFeedbackItems.length === 0) {
    return null
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-semibold tracking-tight'>Feedback Items from students</h1>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <FeedbackItemDisplayPanel feedbackItems={negativeFeedbackItems} feedbackType='negative' />
        <FeedbackItemDisplayPanel feedbackItems={positiveFeedbackItems} feedbackType='positive' />
      </div>
    </div>
  )
}
