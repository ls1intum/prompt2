import { ManagementPageHeader } from '@tumaet/prompt-ui-components'

import { useMyParticipationStore } from '../../zustand/useMyParticipationStore'
import { useSelfEvaluationCategoryStore } from '../../zustand/useSelfEvaluationCategoryStore'

import { CategoryEvaluation } from './components/CategoryEvaluation'

export const SelfEvaluationPage = () => {
  const { myParticipation } = useMyParticipationStore()
  const { selfEvaluationCategories } = useSelfEvaluationCategoryStore()

  return (
    <div className='flex flex-col gap-4'>
      <ManagementPageHeader>Self Evaluation</ManagementPageHeader>
      {myParticipation?.courseParticipationID ?? ''}

      {selfEvaluationCategories.map((category) => (
        <CategoryEvaluation key={category.id} category={category} />
      ))}
    </div>
  )
}
