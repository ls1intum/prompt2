import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { ManagementPageHeader, Card, CardContent, ErrorPage } from '@tumaet/prompt-ui-components'

import { useTeamStore } from '../../zustand/useTeamStore'
import { useTutorEvaluationCategoryStore } from '../../zustand/useTutorEvaluationCategoryStore'

import { FeedbackItemDisplayPanel } from '../components/FeedbackItemDisplayPanel/FeedbackItemDisplayPanel'

import { useGetEvaluationsForTutorInPhase } from './hooks/useGetEvaluationsForTutorInPhase'
import { useGetFeedbackItemsForTutorInPhase } from './hooks/useGetFeedbackItemsForTutorInPhase'
import { CategoryEvaluation } from './components/CategoryEvaluation'

export const TutorEvaluationResultsPage = (): JSX.Element => {
  const { tutorId } = useParams<{ tutorId: string }>()

  const { teams } = useTeamStore()
  const { tutorEvaluationCategories } = useTutorEvaluationCategoryStore()

  const {
    data: tutorEvaluations = [],
    isPending: isEvaluationsPending,
    isError: isEvaluationsError,
    refetch: refetchEvaluations,
  } = useGetEvaluationsForTutorInPhase(tutorId ?? '', {
    enabled: !!tutorId,
  })
  const {
    data: feedbackItems = [],
    isPending: isFeedbackItemsPending,
    isError: isFeedbackItemsError,
    refetch: refetchFeedbackItems,
  } = useGetFeedbackItemsForTutorInPhase(tutorId ?? '', {
    enabled: !!tutorId,
  })

  const isPending = isEvaluationsPending || isFeedbackItemsPending
  const isError = isEvaluationsError || isFeedbackItemsError
  const refetch = () => {
    refetchEvaluations()
    refetchFeedbackItems()
  }

  const tutor = useMemo(() => {
    for (const team of teams) {
      const foundTutor = team.tutors.find((t) => t.id === tutorId)
      if (foundTutor) {
        return {
          id: foundTutor.id,
          firstName: foundTutor.firstName,
          lastName: foundTutor.lastName,
          teamName: team.name,
          teamId: team.id,
        }
      }
    }
    return null
  }, [teams, tutorId])

  const positiveFeedbackItems = useMemo(() => {
    return feedbackItems.filter((item) => item.feedbackType === 'positive')
  }, [feedbackItems])

  const negativeFeedbackItems = useMemo(() => {
    return feedbackItems.filter((item) => item.feedbackType === 'negative')
  }, [feedbackItems])

  if (isError) return <ErrorPage onRetry={refetch} />
  if (isPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  if (!tutor) {
    return <ErrorPage message='The requested tutor could not be found.' />
  }

  return (
    <div className='space-y-4'>
      <ManagementPageHeader>
        Tutor Evaluation Results for {tutor.firstName} {tutor.lastName}
      </ManagementPageHeader>

      {tutorEvaluationCategories.length === 0 ? (
        <Card>
          <CardContent className='p-6'>
            <p className='text-center text-muted-foreground'>
              No evaluation categories configured yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-6'>
          <div className='space-y-4'>
            {tutorEvaluationCategories.map((category) => {
              return (
                <CategoryEvaluation
                  key={category.id}
                  category={category}
                  evaluations={tutorEvaluations.filter((evaluation) =>
                    category.competencies
                      .map((competency) => competency.id)
                      .includes(evaluation.competencyID),
                  )}
                />
              )
            })}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <FeedbackItemDisplayPanel
              feedbackItems={negativeFeedbackItems}
              feedbackType='negative'
              studentName={tutor.firstName}
            />
            <FeedbackItemDisplayPanel
              feedbackItems={positiveFeedbackItems}
              feedbackType='positive'
              studentName={tutor.firstName}
            />
          </div>
        </div>
      )}
    </div>
  )
}
