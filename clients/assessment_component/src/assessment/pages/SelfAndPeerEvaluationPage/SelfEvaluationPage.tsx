import { Loader2 } from 'lucide-react'
import { ManagementPageHeader, ErrorPage } from '@tumaet/prompt-ui-components'

import { useCoursePhaseConfigStore } from '../../zustand/useCoursePhaseConfigStore'
import { useMyParticipationStore } from '../../zustand/useMyParticipationStore'
import { useSelfEvaluationCategoryStore } from '../../zustand/useSelfEvaluationCategoryStore'

import { useGetMyEvaluations } from './hooks/useGetMyEvaluations'
import { useGetMySelfEvaluationCompletion } from './hooks/useGetMySelfEvaluationCompletion'

import { CategoryEvaluation } from './components/CategoryEvaluation'
import { EvaluationCompletion } from './components/EvaluationCompletion/EvaluationCompletion'

export const SelfEvaluationPage = () => {
  const { coursePhaseConfig } = useCoursePhaseConfigStore()
  const { myParticipation } = useMyParticipationStore()
  const { selfEvaluationCategories } = useSelfEvaluationCategoryStore()

  const {
    selfEvaluations: evaluations,
    isPending: isEvaluationsPending,
    isError: isEvaluationsError,
    refetch: refetchEvaluations,
  } = useGetMyEvaluations()

  const {
    data: completion,
    isPending: isCompletionPending,
    isError: isCompletionError,
    refetch: refetchCompletion,
  } = useGetMySelfEvaluationCompletion()

  const isError = isEvaluationsError || isCompletionError
  const isPending = isEvaluationsPending || isCompletionPending
  const refetch = () => {
    refetchEvaluations()
    refetchCompletion()
  }

  if (isError) return <ErrorPage onRetry={refetch} description='Could not fetch self evaluations' />
  if (isPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  return (
    <div className='flex flex-col gap-4'>
      <ManagementPageHeader>Self Evaluation</ManagementPageHeader>

      <p className='text-sm text-gray-600'>
        Please fill out the self-evaluation below to reflect on your performance and contributions.
      </p>

      {selfEvaluationCategories.map((category) => (
        <CategoryEvaluation
          key={category.id}
          courseParticipationID={myParticipation?.courseParticipationID ?? ''}
          category={category}
          evaluations={evaluations}
          completed={completion.completed ?? false}
        />
      ))}

      <EvaluationCompletion
        deadline={coursePhaseConfig?.selfEvaluationDeadline ?? new Date()}
        authorCourseParticipationID={myParticipation?.courseParticipationID ?? ''}
        completed={completion?.completed ?? false}
        completedAt={completion?.completedAt ? new Date(completion.completedAt) : undefined}
      />
    </div>
  )
}
