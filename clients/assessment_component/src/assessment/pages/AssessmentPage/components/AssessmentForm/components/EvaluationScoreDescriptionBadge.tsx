import { Badge } from '@tumaet/prompt-ui-components'

import { Competency } from '../../../../../interfaces/competency'
import { ScoreLevel } from '../../../../../interfaces/scoreLevel'

import { getLevelConfig } from '../../../../utils/getLevelConfig'
import { getScoreLevelDescription } from '../../../../utils/getScoreLevelDescription'

interface EvaluationScoreDescriptionBadgeProps {
  name: string
  competency?: Competency
  scoreLevel?: ScoreLevel
}

export const EvaluationScoreDescriptionBadge = ({
  name,
  competency,
  scoreLevel,
}: EvaluationScoreDescriptionBadgeProps) => {
  const config = getLevelConfig(scoreLevel || ScoreLevel.VeryBad)

  return (
    <div className='flex items-center gap-2'>
      <span className='font-medium'>{name}:</span>
      <Badge
        className={`${config.textColor} ${config.selectedBg} hover:${config.selectedBg} cursor-help`}
        style={{ whiteSpace: 'nowrap' }}
      >
        {getScoreLevelDescription(scoreLevel || ScoreLevel.VeryBad, competency!) || ''}
      </Badge>
    </div>
  )
}
