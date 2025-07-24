import { MessageCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@tumaet/prompt-ui-components'

import type { FeedbackItem, FeedbackType } from '../../../../../interfaces/feedbackItem'
import { FeedbackItemRow } from './FeedbackItemRow'

interface FeedbackItemDisplayPanelProps {
  feedbackItems: FeedbackItem[]
  feedbackType: FeedbackType
}

export const FeedbackItemDisplayPanel = ({
  feedbackItems,
  feedbackType,
}: FeedbackItemDisplayPanelProps) => {
  const panelTitle =
    feedbackType === 'positive' ? 'What was done particularly well' : 'Areas for improvement'

  const iconColor = feedbackType === 'positive' ? 'text-green-600' : 'text-red-600'

  if (feedbackItems.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <MessageCircle className={`h-5 w-5 ${iconColor}`} />
          {panelTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {feedbackItems.map((item) => (
          <FeedbackItemRow key={item.id} feedbackItem={item} />
        ))}
      </CardContent>
    </Card>
  )
}
