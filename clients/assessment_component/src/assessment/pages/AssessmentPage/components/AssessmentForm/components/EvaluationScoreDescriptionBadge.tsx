import { Badge } from '@tumaet/prompt-ui-components'

import { Competency } from '../../../../../interfaces/competency'
import { ScoreLevel } from '../../../../../interfaces/scoreLevel'

import { getLevelConfig } from '../../../../utils/getLevelConfig'

interface EvaluationScoreDescriptionBadgeProps {
  name: string
  competency: Competency
  scoreLevel: ScoreLevel
}

export const EvaluationScoreDescriptionBadge = ({
  name,
  competency,
  scoreLevel,
}: EvaluationScoreDescriptionBadgeProps) => {
  const config = getLevelConfig(scoreLevel)

  const answerText = (() => {
    switch (scoreLevel) {
      case ScoreLevel.VeryBad:
        return competency.descriptionVeryBad
      case ScoreLevel.Bad:
        return competency.descriptionBad
      case ScoreLevel.Ok:
        return competency.descriptionOk
      case ScoreLevel.Good:
        return competency.descriptionGood
      case ScoreLevel.VeryGood:
        return competency.descriptionVeryGood
    }
  })()

  return (
    <div className='flex items-center gap-2'>
      <span className='font-medium'>{name}:</span>
      <Badge
        className={`${config.textColor} ${config.selectedBg} hover:${config.selectedBg} cursor-help`}
        style={{ whiteSpace: 'nowrap' }}
      >
        {answerText}
      </Badge>
    </div>
  )
}
