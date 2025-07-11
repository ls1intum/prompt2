import { ManagementPageHeader } from '@tumaet/prompt-ui-components'

import { useCoursePhaseConfigStore } from '../../zustand/useCoursePhaseConfigStore'
import { useMyParticipationStore } from '../../zustand/useMyParticipationStore'
import { useSelfEvaluationCategoryStore } from '../../zustand/useSelfEvaluationCategoryStore'
import { useEvaluationStore } from '../../zustand/useEvaluationStore'

import { CategoryEvaluation } from './components/CategoryEvaluation'
import { EvaluationCompletionPage } from './components/EvaluationCompletionPage/EvaluationCompletionPage'

export const SelfEvaluationPage = () => {
  const { coursePhaseConfig } = useCoursePhaseConfigStore()
  const { myParticipation } = useMyParticipationStore()
  const { selfEvaluationCategories } = useSelfEvaluationCategoryStore()
  const { selfEvaluations: evaluations, selfEvaluationCompletion: completion } =
    useEvaluationStore()

  return (
    <div className='flex flex-col gap-4'>
      <ManagementPageHeader>Self Evaluation</ManagementPageHeader>

      <p className='text-sm text-gray-600 dark:text-gray-400'>
        Please fill out the self-evaluation below to reflect on your performance and contributions.
      </p>

      {selfEvaluationCategories.map((category) => (
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
        courseParticipationID={myParticipation?.courseParticipationID ?? ''}
        authorCourseParticipationID={myParticipation?.courseParticipationID ?? ''}
        completed={completion?.completed ?? false}
        completedAt={completion?.completedAt ? new Date(completion.completedAt) : undefined}
      />
    </div>
  )
}
