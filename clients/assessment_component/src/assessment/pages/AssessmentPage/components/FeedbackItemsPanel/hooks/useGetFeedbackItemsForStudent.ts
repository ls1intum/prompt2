import { useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { FeedbackItem } from '../../../../../interfaces/feedbackItem'
import { getFeedbackItemsForStudent } from '../../../../../network/queries/getFeedbackItemsForStudent'

export const useGetFeedbackItemsForStudent = (courseParticipationID: string) => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const { data, ...queryInfo } = useQuery<FeedbackItem[]>({
    queryKey: ['student-feedback-items', phaseId, courseParticipationID],
    queryFn: () => getFeedbackItemsForStudent(phaseId ?? '', courseParticipationID),
    enabled: !!phaseId && !!courseParticipationID,
  })

  const feedbackItems = useMemo(
    () => data?.filter((item) => item.feedbackText !== '') || [],
    [data],
  )

  const positiveFeedbackItems = useMemo(
    () => feedbackItems.filter((item) => item.feedbackType === 'positive'),
    [feedbackItems],
  )

  const negativeFeedbackItems = useMemo(
    () => feedbackItems.filter((item) => item.feedbackType === 'negative'),
    [feedbackItems],
  )

  return {
    feedbackItems,
    positiveFeedbackItems,
    negativeFeedbackItems,
    ...queryInfo,
  }
}
