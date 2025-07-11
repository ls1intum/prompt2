import { useParams } from 'react-router-dom'

import { ManagementPageHeader } from '@tumaet/prompt-ui-components'

import { useCoursePhaseConfigStore } from '../../zustand/useCoursePhaseConfigStore'
import { useMyParticipationStore } from '../../zustand/useMyParticipationStore'
import { usePeerEvaluationCategoryStore } from '../../zustand/usePeerEvaluationCategoryStore'
import { useEvaluationStore } from '../../zustand/useEvaluationStore'

import { CategoryEvaluation } from './components/CategoryEvaluation'
import { EvaluationCompletionPage } from './components/EvaluationCompletionPage/EvaluationCompletionPage'

export const PeerEvaluationPage = () => {
  const { courseParticipationID } = useParams<{ courseParticipationID: string }>()

  const { coursePhaseConfig } = useCoursePhaseConfigStore()
  const { myParticipation } = useMyParticipationStore()
  const { peerEvaluationCategories } = usePeerEvaluationCategoryStore()
  const { peerEvaluations: evaluations, peerEvaluationCompletions: peerEvaluationCompletions } =
    useEvaluationStore()
  const completion = peerEvaluationCompletions.find(
    (c) => c.courseParticipationID === courseParticipationID,
  )

  return (
    <div className='flex flex-col gap-4'>
      <ManagementPageHeader>Peer Evaluation</ManagementPageHeader>

      <p className='text-sm text-gray-600 dark:text-gray-400'>
        Please fill out the Peer evaluation below to assess the performance and contributions of
        your team members.
      </p>

      {peerEvaluationCategories.map((category) => (
        <CategoryEvaluation
          key={category.id}
          courseParticipationID={courseParticipationID ?? ''}
          category={category}
          evaluations={evaluations.filter(
            (evaluation) => evaluation.courseParticipationID === courseParticipationID,
          )}
          completed={completion?.completed ?? false}
        />
      ))}

      <EvaluationCompletionPage
        deadline={coursePhaseConfig?.selfEvaluationDeadline ?? new Date()}
        courseParticipationID={courseParticipationID ?? ''}
        authorCourseParticipationID={myParticipation?.courseParticipationID ?? ''}
        completed={completion?.completed ?? false}
        completedAt={completion?.completedAt ? new Date(completion.completedAt) : undefined}
      />
    </div>
  )
}
