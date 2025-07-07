import { Loader2 } from 'lucide-react'
import { ManagementPageHeader, ErrorPage } from '@tumaet/prompt-ui-components'

import { useMyParticipationStore } from '../../zustand/useMyParticipationStore'
import { useSelfEvaluationCategoryStore } from '../../zustand/useSelfEvaluationCategoryStore'

import { useGetMyEvaluations } from './hooks/useGetMyEvaluations'

import { CategoryEvaluation } from './components/CategoryEvaluation'

export const SelfEvaluationPage = () => {
  const { myParticipation } = useMyParticipationStore()
  const { selfEvaluationCategories } = useSelfEvaluationCategoryStore()

  const {
    selfEvaluations: evaluations,
    isPending: isEvaluationsPending,
    isError: isEvaluationsError,
    refetch: refetchEvaluations,
  } = useGetMyEvaluations()

  if (isEvaluationsError)
    return <ErrorPage onRetry={refetchEvaluations} description='Could not fetch self evaluations' />
  if (isEvaluationsPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  return (
    <div className='flex flex-col gap-4'>
      <ManagementPageHeader>Self Evaluation</ManagementPageHeader>

      {selfEvaluationCategories.map((category) => (
        <CategoryEvaluation
          key={category.id}
          courseParticipationID={myParticipation?.courseParticipationID ?? ''}
          category={category}
          evaluations={evaluations}
          completed={false}
        />
      ))}
    </div>
  )
}
