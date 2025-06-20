import React from 'react'
import { Badge } from '@tumaet/prompt-ui-components'

import { getLevelConfig } from '../utils/getLevelConfig'
import { mapNumberToScoreLevel, ScoreLevel } from '../../interfaces/scoreLevel'

interface ScoreLevelBadgeProps {
  scoreLevel?: ScoreLevel
  scoreNumeric?: number
}

export const StudentScoreBadge = ({ scoreLevel, scoreNumeric }: ScoreLevelBadgeProps) => {
  const config = getLevelConfig(
    scoreLevel
      ? scoreLevel
      : scoreNumeric
        ? mapNumberToScoreLevel(scoreNumeric)
        : ScoreLevel.VeryBad,
  )

  return (
    <Badge
      className={`${config.textColor} ${config.selectedBg} hover:${config.selectedBg}`}
      style={{ whiteSpace: 'nowrap' }}
    >
      {scoreLevel ? config.title : ''}
      {scoreLevel && scoreNumeric ? ' — ' : ''}
      {scoreNumeric ? `${scoreNumeric.toFixed(1)}` : ''}
    </Badge>
  )
}
