import { useNavigate, useLocation } from 'react-router-dom'

import { ManagementPageHeader, Card } from '@tumaet/prompt-ui-components'

import { useEvaluationStore } from '../../zustand/useEvaluationStore'

export const SelfAndPeerEvaluationOverviewPage = () => {
  const navigate = useNavigate()
  const path = useLocation().pathname

  const { peerEvaluationCompletions } = useEvaluationStore()

  return (
    <div className='flex flex-col gap-4'>
      <ManagementPageHeader>Self Evaluation</ManagementPageHeader>
      <h1 className='text-2xl font-bold'>Self Evaluation</h1>
      {/* Add components for self and peer evaluation management here */}

      <Card
        className='p-6 flex items-center justify-center cursor-pointer'
        onClick={() => navigate(`${path}/self-evaluation`)}
      >
        <h2>Self Evaluation</h2>
      </Card>

      <h1 className='text-2xl font-bold'>Peer Evaluation</h1>
      <Card
        className='p-6 flex items-center justify-center cursor-pointer'
        onClick={() =>
          navigate(`${path}/peer-evaluation/${peerEvaluationCompletions[0]?.courseParticipationID}`)
        }
      >
        <h2>Hans Meyer</h2>
      </Card>
    </div>
  )
}
