import { useLocation } from 'react-router-dom'

import { ManagementPageHeader } from '@tumaet/prompt-ui-components'

import { useEvaluationStore } from '../../zustand/useEvaluationStore'
import { useSelfEvaluationCategoryStore } from '../../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../../zustand/usePeerEvaluationCategoryStore'

import { EvaluationInfoCard } from './components/EvaluationInfoCard'

export const SelfAndPeerEvaluationOverviewPage = () => {
  const path = useLocation().pathname

  const { selfEvaluations, peerEvaluations, selfEvaluationCompletion, peerEvaluationCompletions } =
    useEvaluationStore()
  const { selfEvaluationCategories } = useSelfEvaluationCategoryStore()
  const { peerEvaluationCategories } = usePeerEvaluationCategoryStore()

  const selfEvaluationCompetencyCount = selfEvaluationCategories.reduce(
    (count, category) => count + category.competencies.length,
    0,
  )
  const peerEvaluationCompetencyCount = peerEvaluationCategories.reduce(
    (count, category) => count + category.competencies.length,
    0,
  )

  return (
    <div className='flex flex-col gap-4'>
      <ManagementPageHeader>Self Evaluation and Peer Evaluation</ManagementPageHeader>
      <h1 className='text-2xl font-bold'>Self Evaluation</h1>

      <EvaluationInfoCard
        name='Self Evaluation'
        navigationPath={`${path}/self-evaluation`}
        competencyCount={selfEvaluationCompetencyCount}
        completed={selfEvaluationCompletion?.completed ?? false}
        evaluations={selfEvaluations}
      />

      <h1 className='text-2xl font-bold'>Peer Evaluation</h1>
      <EvaluationInfoCard
        name='Hans Meyer'
        navigationPath={`${path}/peer-evaluation/${peerEvaluationCompletions[0]?.courseParticipationID}`}
        competencyCount={peerEvaluationCompetencyCount}
        completed={peerEvaluationCompletions[0]?.completed ?? false}
        evaluations={peerEvaluations.filter(
          (evaluation) =>
            evaluation.courseParticipationID ===
            peerEvaluationCompletions[0]?.courseParticipationID,
        )}
      />
    </div>
  )
}
