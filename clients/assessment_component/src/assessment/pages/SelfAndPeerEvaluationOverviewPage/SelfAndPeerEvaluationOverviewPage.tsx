import { useNavigate, useLocation } from 'react-router-dom'

import { ManagementPageHeader, Card } from '@tumaet/prompt-ui-components'

export const SelfAndPeerEvaluationOverviewPage = () => {
  const navigate = useNavigate()
  const path = useLocation().pathname

  return (
    <div className='flex flex-col gap-4'>
      <ManagementPageHeader>Self Evaluation</ManagementPageHeader>
      <h1 className='text-2xl font-bold'>Self and Peer Evaluation</h1>
      <p className='text-gray-600'>
        This page allows you to manage self and peer evaluation settings for your assessment.
      </p>
      {/* Add components for self and peer evaluation management here */}

      <Card
        className='p-6 flex items-center justify-center cursor-pointer'
        onClick={() => navigate(`${path}/self-evaluation`)}
      >
        <h2>Self Evaluation</h2>
      </Card>
    </div>
  )
}
