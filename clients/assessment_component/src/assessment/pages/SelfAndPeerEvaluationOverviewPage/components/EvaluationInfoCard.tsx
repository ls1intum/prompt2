import { useNavigate } from 'react-router-dom'

import { Card } from '@tumaet/prompt-ui-components'

import { Evaluation } from '../../../interfaces/evaluation'

import { AssessmentStatusBadge } from '../../components/AssessmentStatusBadge'

interface EvaluationInfoCardProps {
  name: string
  navigationPath: string
  competencyCount: number
  completed?: boolean
  evaluations?: Evaluation[]
}

export const EvaluationInfoCard = ({
  name,
  navigationPath,
  competencyCount,
  completed = false,
  evaluations,
}: EvaluationInfoCardProps) => {
  const navigate = useNavigate()

  return (
    <Card className='p-6 flex cursor-pointer' onClick={() => navigate(navigationPath)}>
      <div className='flex justify-between items-center w-full'>
        <div className='flex-1'>
          <h2 className='text-xl font-semibold tracking-tight'>{name}</h2>
        </div>
        <div className='flex-shrink-0'>
          <AssessmentStatusBadge
            remainingAssessments={competencyCount - (evaluations?.length || 0)}
            isFinalized={completed}
            isEvaluation={true}
          />
        </div>
      </div>
    </Card>
  )
}
