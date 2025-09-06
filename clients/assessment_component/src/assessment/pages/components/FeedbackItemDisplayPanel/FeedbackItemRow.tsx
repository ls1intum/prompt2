import { User, Users } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@tumaet/prompt-ui-components'

import type { FeedbackItem } from '../../../interfaces/feedbackItem'
import { useTeamStore } from '../../../zustand/useTeamStore'

interface FeedbackItemRowProps {
  feedbackItem: FeedbackItem
}

export const FeedbackItemRow = ({ feedbackItem }: FeedbackItemRowProps) => {
  const { teams } = useTeamStore()

  const isSelfFeedback =
    feedbackItem.courseParticipationID === feedbackItem.authorCourseParticipationID

  const getAuthorName = () => {
    if (isSelfFeedback) return null

    for (const team of teams) {
      const author = team.members.find(
        (member) => member.id === feedbackItem.authorCourseParticipationID,
      )
      if (author) {
        return `${author.firstName} ${author.lastName}`
      }
    }
    return 'Unknown Author'
  }

  const authorName = getAuthorName()

  return (
    <div className='p-3 border rounded-md bg-muted/50 relative'>
      <div className='flex items-start justify-between gap-2'>
        <p className='text-sm text-foreground whitespace-pre-wrap flex-1'>
          {feedbackItem.feedbackText}
        </p>

        <div className='flex-shrink-0 mt-1'>
          {isSelfFeedback ? (
            <User
              className='h-4 w-4 text-blue-500 dark:text-blue-400'
              aria-label='Self feedback'
              role='img'
            />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Users
                    className='h-4 w-4 text-green-600 dark:text-green-400'
                    aria-label='Author information'
                    role='img'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Author: {authorName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  )
}
