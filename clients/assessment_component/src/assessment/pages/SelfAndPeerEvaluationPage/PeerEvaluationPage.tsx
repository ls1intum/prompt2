import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { ManagementPageHeader, ErrorPage } from '@tumaet/prompt-ui-components'

import { useCoursePhaseConfigStore } from '../../zustand/useCoursePhaseConfigStore'
import { useMyParticipationStore } from '../../zustand/useMyParticipationStore'
import { usePeerEvaluationCategoryStore } from '../../zustand/usePeerEvaluationCategoryStore'
import { useEvaluationStore } from '../../zustand/useEvaluationStore'

import { useGetMyEvaluations } from '../hooks/useGetMyEvaluations'

import { CategoryEvaluation } from './components/CategoryEvaluation'
import { EvaluationCompletionPage } from './components/EvaluationCompletionPage/EvaluationCompletionPage'

export const PeerEvaluationPage = () => {
  const { courseParticipationID } = useParams<{ courseParticipationID: string }>()

  const { coursePhaseConfig } = useCoursePhaseConfigStore()
  const { myParticipation } = useMyParticipationStore()
  const { peerEvaluationCategories } = usePeerEvaluationCategoryStore()
  const { peerEvaluationCompletions: peerEvaluationCompletions } = useEvaluationStore()
  const completion = peerEvaluationCompletions.find(
    (c) => c.courseParticipationID === courseParticipationID,
  )

  const { peerEvaluations: evaluations, isPending, isError, refetch } = useGetMyEvaluations()

  if (isError) return <ErrorPage onRetry={refetch} description='Could not fetch self evaluations' />
  if (isPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  return (
    <div className='flex flex-col gap-4'>
      <ManagementPageHeader>Peer Evaluation</ManagementPageHeader>

      <p className='text-sm text-gray-600'>
        Please fill out the Peer evaluation below to assess the performance and contributions of
        your team members.
      </p>

      {peerEvaluationCategories.map((category) => (
        <CategoryEvaluation
          key={category.id}
          courseParticipationID={myParticipation?.courseParticipationID ?? ''}
          category={category}
          evaluations={evaluations}
          completed={completion?.completed ?? false}
        />
      ))}

      <EvaluationCompletionPage
        deadline={coursePhaseConfig?.selfEvaluationDeadline ?? new Date()}
        authorCourseParticipationID={myParticipation?.courseParticipationID ?? ''}
        completed={completion?.completed ?? false}
        completedAt={completion?.completedAt ? new Date(completion.completedAt) : undefined}
      />
    </div>
  )
}
